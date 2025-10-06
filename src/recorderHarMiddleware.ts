import express from 'express';
import type { Entry, Header } from 'har-format';
import * as http from 'http';
import zlib from 'node:zlib';

import { createHarEntryFromText, type AppendEntryAndSaveHarFn } from './harUtils.js';

// Extend Express Request to include buffered body. Reusing .body was also possible
// but could be confusing as .body is often used for parsed JSON or form data.
declare module 'express-serve-static-core' {
  interface Request {
    rawBody?: Buffer;
  }
}

/**
 * Creates a proxy response handler to be used as the `onProxyRes` callback in http-proxy-middleware.
 *
 * The handler:
 * - Streams response chunks to the client immediately
 * - Accumulates chunks for HAR file recording
 * - Decompresses gzipped responses for HAR file
 *
 * @param {string} harFilePath - The file path to save the HAR file.
 * @param {AppendEntryAndSaveHarFn} appendEntryAndSaveHar - Function to append the new entry and save the HAR file.
 * @param {string} targetUrl - The prefix for the HAR playback endpoint.
 * @returns {function} A event handler for http-proxy-middleware's `onProxyRes`.
 */
export const recorderHarMiddleware = (harFilePath: string, appendEntryAndSaveHar: AppendEntryAndSaveHarFn, targetUrl: string) => {
  return (proxyRes: http.IncomingMessage, req: express.Request, res: express.Response) => {
    const startTime = new Date().getTime();
    const newRequestEntry: Entry = createHarEntry(targetUrl, proxyRes, req);

    // Accumulate upstream response chunks to be able to decompress the accumulated gzip for HAR file
    const upstreamResponseChunks: Buffer[] = [];
    const isGzip = proxyRes.headers['content-encoding'] === 'gzip';

    // Forward response status code and headers from upstream to client immediately
    res.statusCode = proxyRes.statusCode || 502;
    Object.entries(proxyRes.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        res.setHeader(key, value);
      }
    });

    proxyRes.on('data', (chunk: Buffer) => {
      // Accumulate chunks for HAR file
      upstreamResponseChunks.push(chunk);

      // Stream raw data to client immediately
      res.write(chunk);
    });

    proxyRes.on('end', async () => {
      try {
        // Concatenate all chunks for HAR processing
        const rawData = Buffer.concat(upstreamResponseChunks as Uint8Array[]);

        // Decompress ONLY for HAR file, not for client
        let responseText: string;

        if (isGzip) {
          try {
            const decompressed = zlib.gunzipSync(rawData as Uint8Array);
            responseText = decompressed.toString('utf-8');
          } catch (error) {
            console.error('Failed to decompress gzip data for HAR:', error);
            // Fall back to raw data if decompression fails
            responseText = rawData.toString('utf-8');
          }
        } else {
          responseText = rawData.toString('utf-8');
        }

        // Update the HAR entry with the complete decompressed response
        const endTime = new Date().getTime();
        newRequestEntry.time = endTime - startTime;
        newRequestEntry.timings.receive = newRequestEntry.time;
        newRequestEntry.response.content.text = responseText;
        newRequestEntry.response.content.size = responseText.length;

        // Save to HAR file
        await appendEntryAndSaveHar(newRequestEntry, harFilePath);

        // Close the response stream to the client
        res.end();
      } catch (error) {
        console.error('Error processing response:', error);
        res.statusCode = 500;
        res.end('Proxy error');
      }
    });

    proxyRes.on('error', (error) => {
      console.error('Proxy response error:', error);
      res.statusCode = 502;
      res.end('Bad Gateway');
    });
  };
};

/**
 * Creates a HAR entry for the given proxy response and request.
 *
 * @param targetUrl The prefix for the HAR playback endpoint.
 * @param proxyRes Response from the target server.
 * @param req Incoming request from the client.
 * @returns A HAR entry for the request and response.
 */
function createHarEntry(targetUrl: string, proxyRes: http.IncomingMessage, req: express.Request): Entry {
  const entry = createHarEntryFromText({
    baseUrl: targetUrl,
    endpoint: req.originalUrl,
    text: '',
    mimeType: proxyRes.headers['content-type'] || 'text/plain',
    requestMethod: req.method,
    statusCode: proxyRes.statusCode || 502,
    headers: convertToHarHeaders(proxyRes.headers),
  });

  // Add request headers to the HAR entry
  entry.request.headers = convertToHarHeaders(req.headers);

  // Add query string parameters
  if (req.query && Object.keys(req.query).length > 0) {
    entry.request.queryString = Object.entries(req.query).map(([name, value]) => ({
      name,
      value: Array.isArray(value) ? value.join(',') : String(value),
    }));
  }

  // Add POST/PUT/PATCH request body if available
  if (req.rawBody && req.rawBody.length > 0 && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    entry.request.postData = {
      mimeType: contentType,
      text: req.rawBody.toString('utf-8'),
    };
    entry.request.bodySize = req.rawBody.length;
  }

  return entry;
}

/**
 * Processes a single header value and returns an object with the header name and value.
 *
 * @param name The header name.
 * @param value The header value.
 * @returns An object with the header name and value.
 */
function processHeaderValue(name: string, value: string): Header {
  return { name, value };
}

/**
 * Converts a single incoming header to an array of HAR headers.
 *
 * @param name The header name.
 * @param value The header value.
 * @returns An array of headers in HAR format.
 */
function convertIncomingHeaderToHar(name: string, value: string | string[]): Header[] {
  const values = Array.isArray(value) ? value : [value];
  return values.map((val) => processHeaderValue(name, val));
}

/**
 * Converts the given incoming headers to HAR format.
 *
 * @param incomingHeaders The incoming headers to convert.
 * @returns An array of headers in HAR format.
 */
function convertToHarHeaders(incomingHeaders: http.IncomingHttpHeaders): Header[] {
  const harHeaders: Header[] = [];

  Object.entries(incomingHeaders)
    .filter(([, value]) => typeof value === 'string' || Array.isArray(value))
    .forEach(([name, value]) => {
      harHeaders.push(...convertIncomingHeaderToHar(name, value as string | string[]));
    });

  return harHeaders;
}

/**
 * Express middleware that buffers the __client request body__ stream.
 *
 * HTTP request bodies are streams that can only be read once, creating a conflict:
 * - The proxy needs to forward the body to the upstream server
 * - The HAR recorder needs to save the body to the HAR file
 * - Streams can only be consumed once
 *
 * This middleware uses express.raw() to:
 * 1. Read all chunks from the incoming request stream
 * 2. Concatenate them into a single Buffer
 * 3. Store the buffer in req.rawBody for later use
 * 4. Allow the proxy to forward the buffered body to upstream
 * 5. Allow the HAR recorder to save the buffered body to the HAR file
 *
 * Note: The response side uses a different approach - it streams chunks to the
 * client immediately while accumulating them for the HAR file in parallel.
 */
export const requestBodyBufferMiddleware = express.raw({
  type: () => true, // Capture all content types
  limit: '50mb', // Can be adjusted if needed
  // This function is called before the body is fully parsed,
  // Receives the raw Buffer (buf) of the complete body
  // and stores it in req.rawBody so we can access it later
  verify: (req: express.Request, _res, buf) => {
    // Store the full raw buffer on the request, so the HAR can save it
    // in a HAR file and the proxy can forward it to the upstream server
    req.rawBody = buf;
  },
});
