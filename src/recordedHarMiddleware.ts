import type { Request, Response, NextFunction } from 'express';
import type { LoadHarDataFn } from './harLogger';
import { findHarEntry } from './harLogger';

/**
 * A middleware factory that reads the HAR file and returns the body of the recorded request
 * based on the path and method.
 *
 * @param {string} harFilePath - The path of the HAR file to read
 * @returns {function} Express middleware
 */
export const recordedHarMiddleware = (harFilePath: string, getHar: LoadHarDataFn) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const har = await getHar(harFilePath);
      const path = req.params.path;
      const method = req.method;

      const recordedEntry = findHarEntry(har.log, method, path);

      if (recordedEntry) {
        const { status, content } = recordedEntry.response;
        res.status(status).set('Content-Type', content.mimeType);
        res.send(content.text);
      } else {
        return next();
      }
    } catch (error) {
      console.error('Error:', error);
      return next();
    }
  };
};
