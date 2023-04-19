import { Entry, Har, Log } from 'har-format';

/**
 * A type representing a function that retrieves a HAR object from a given file.
 *
 * @typedef LoadHarDataFn
 * @type {function}
 * @param {string} filePath - The path of the file to read the HAR data from.
 * @returns {Promise<Har>} A promise that resolves to the HAR object.
 */
export type LoadHarDataFn = (filePath: string) => Promise<Har>;

/**
 * A type representing a function that sets a new HAR entry and saves it to a given file.
 *
 * @typedef AppendEntryAndSaveHarFn
 * @type {function}
 * @param {Entry} entry - The new HAR entry to be added.
 * @param {string} filePath - The path of the file to save the updated HAR data to.
 * @returns {Promise<Har>} A promise that resolves to the updated HAR object.
 */
export type AppendEntryAndSaveHarFn = (entry: Entry, filePath: string) => Promise<Har>;

/**
 * Finds the HAR entry in the given log with the matching HTTP method, base URL, and query parameters.
 *
 * @param {Log} harLog - The HAR log to search through.
 * @param {string} method - The HTTP method of the desired entry.
 * @param {string} baseUrl - The base URL of the desired entry.
 * @returns {Entry | null} The matching HAR entry if found, or null if not found.
 */
export function findHarEntry(harLog: Log, method: string, baseUrl: string): Entry | null {
  for (const entry of harLog.entries) {
    const urlObject = new URL(entry.request.url);
    const pathname = baseUrl || '/';

    if (entry.request.method === method && urlObject.pathname === pathname) {
      return entry;
    }
  }
  return null;
}