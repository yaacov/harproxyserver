import type { IncomingMessage } from 'http';

import type express from 'express';
import type { Entry } from 'har-format';
import { StatusCodes } from 'http-status-codes';

import { convertToHarHeaders, saveHarLog } from './harLogger';


/**
 * Middleware factory that records an HTTP request-response transaction and saves it in a HAR file.
 *
 * @param {string} targetUrl - The target URL to proxy.
 * @param {string} HARFileName - The file path to save the HAR file.
 * @returns {function} Custom proxy response handler.
 */
export const recorderHarMiddleware = (targetUrl: string, HARFileName: string) => {
  return (proxyRes: IncomingMessage, req: express.Request) => {
    const startTime = new Date().getTime();
    const request: Entry = createHarEntry(proxyRes, req, startTime);

    proxyRes.on('data', (chunk: string) => {
      updateEntryOnData(request, startTime, chunk);
    });

    proxyRes.on('end', () => {
      saveHarLog(request, HARFileName);
    });
  };
};

/**
 * Creates a HAR entry for the given proxy response and request.
 *
 * @param proxyRes Response from the target server.
 * @param req Incoming request from the client.
 * @param startTime The start time of the request in milliseconds.
 * @returns A HAR entry for the request and response.
 */
function createHarEntry(proxyRes: IncomingMessage, req: express.Request, startTime: number): Entry {
  return {
    startedDateTime: new Date(startTime).toISOString(),
    cache: {},
    request: {
      method: req.method,
      url: req.url,
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headers: convertToHarHeaders(req.headers),
      queryString: [],
      headersSize: -1,
      bodySize: -1,
    },
    response: {
      status: proxyRes.statusCode || StatusCodes.BAD_GATEWAY,
      statusText: proxyRes.statusMessage || '',
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headers: convertToHarHeaders(proxyRes.headers),
      content: {
        size: 0,
        text: '',
        mimeType: proxyRes.headers['content-type'] || 'text/plain',
      },
      redirectURL: '',
      headersSize: -1,
      bodySize: -1,
    },
    time: 0,
    timings: {
      send: 0,
      wait: 0,
      receive: 0,
    },
  };
}

/**
 * Updates the given HAR entry with data received from the target server.
 *
 * @param entry The HAR entry to update.
 * @param startTime The start time of the request in milliseconds.
 * @param chunk A chunk of data received from the target server.
 */
function updateEntryOnData(entry: Entry, startTime: number, chunk: string) {
  const endTime = new Date().getTime();
  entry.time = endTime - startTime;
  entry.timings.receive = entry.time;

  entry.response.content.text = entry.response.content.text?.concat(chunk) || '';
  entry.response.content.size = entry.response.content.text?.length || 0;
}
