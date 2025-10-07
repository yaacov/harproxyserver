import type { NextFunction, Request, Response } from 'express';
import zlib from 'node:zlib';
import type { LoadHarDataFn } from './harUtils.js';
import { findHarEntry } from './harUtils.js';

/**
 * A middleware factory that reads the HAR file and returns the body of the recorded request
 * based on the path and method.
 *
 * @param {string} harFilePath - The path of the HAR file to read
 * @returns {function} Express middleware
 */
export const recordedHarMiddleware = (harFilePath: string, getHar: LoadHarDataFn, prefix: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const har = await getHar(harFilePath);
      const baseUrl = req.originalUrl.slice(prefix.length); // remove prefix
      const method = req.method;

      const recordedEntry = findHarEntry(har.log, method, baseUrl);

      if (recordedEntry) {
        const { status, content, headers } = recordedEntry.response;

        // Check if the response should be gzipped
        const contentEncodingHeader = headers.find((h) => h.name.toLowerCase() === 'content-encoding');
        const shouldGzip = contentEncodingHeader?.value.toLowerCase() === 'gzip';

        // Set all headers from the recorded response
        headers.forEach((header) => {
          res.set(header.name, header.value);
        });

        res.status(status);
        if (content.text == undefined) {
          console.error(`HAR entry has no body`);
          return next();
        }

        // Prepare the response content
        let responseBuffer: Buffer;
        switch (content.encoding) {
          case undefined: {
            responseBuffer = Buffer.from(content.text, 'utf-8');
            break;
          }
          case 'base64': {
            responseBuffer = Buffer.from(content.text, 'base64');
            break;
          }
          default: {
            console.error(`Unknown .content.encoding in HAR entry: ${content.encoding}`);
            return next();
          }
        }

        // If the original response was gzipped, re-compress it
        if (shouldGzip) {
          try {
            const gzipped = zlib.gzipSync(responseBuffer as Uint8Array);
            res.send(gzipped);
          } catch (error) {
            console.error('Failed to gzip response:', error);
            return next();
          }
        } else {
          res.send(responseBuffer);
        }
      } else {
        return next();
      }
    } catch (error) {
      console.error('Error:', error);
      return next();
    }
  };
};
