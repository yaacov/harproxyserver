import fs from 'fs';

import type { Request, Response, NextFunction } from 'express';
import type { Har, Log, Entry } from 'har-format';

/**
 * Finds the HAR entry in the given log with the matching HTTP method and path.
 *
 * @param harLog The HAR log to search through.
 * @param method The HTTP method of the desired entry.
 * @param path The path of the desired entry.
 * @returns The matching HAR entry if found, or null if not found.
 */
export function findHarEntry(harLog: Log, method: string, path: string): Entry | null {
  for (const entry of harLog.entries) {
    if (entry.request.method === method && entry.request.url.endsWith(path)) {
      return entry;
    }
  }
  return null;
}

/**
 * Reads a HAR file and returns the parsed HAR object.
 *
 * @param {string} harFilePath - The path of the HAR file to read
 * @returns {Promise<Har>} The parsed HAR object
 */
export async function readHarFile(harFilePath: string): Promise<Har> {
  return new Promise((resolve, reject) => {
    fs.readFile(harFilePath, (err, data) => {
      if (err) {
        console.error('Error reading HAR file:', err);
        reject(err);
      } else {
        try {
          const har = JSON.parse(data.toString()) as Har;
          resolve(har);
        } catch (error) {
          console.error('Error parsing HAR file:', error);
          reject(error);
        }
      }
    });
  });
}

/**
 * A middleware factory that reads the HAR file and returns the body of the recorded request
 * based on the path and method.
 *
 * @param {string} harFilePath - The path of the HAR file to read
 * @returns {function} Express middleware
 */
export const recordedHarMiddleware = (harFilePath: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const har = await readHarFile(harFilePath);
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
