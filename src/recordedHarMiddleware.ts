import type { NextFunction, Request, Response } from 'express';
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

        // Set all headers from the recorded response
        headers.forEach((header) => {
          res.set(header.name, header.value);
        });

        res.status(status);
        if (content.text == undefined) {
          console.error(`HAR entry has no body`);
          return next();
        }
        switch (content.encoding) {
          case undefined: {
            res.send(content.text);
            break;
          }
          case 'base64': {
            res.send(Buffer.from(content.text, 'base64'));
            break;
          }
          default: {
            console.error(`Unknown .content.encoding in HAR entry: ${content.encoding}`);
            return next();
          }
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
