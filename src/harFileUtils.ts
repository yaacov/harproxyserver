import fs from 'fs/promises';

import { Entry, Har, Log } from 'har-format';
import { filterHarLog } from './harUtils';

/**
 * Reads a HAR file and returns the parsed HAR object.
 *
 * @param {string} filePath - The path of the HAR file to read
 * @returns {Promise<Har>} The parsed HAR object
 * @throws Will throw an error if the HAR file cannot be read or parsed
 */
export async function loadHarData(filePath: string): Promise<Har> {
  try {
    const data = await fs.readFile(filePath);
    const har = JSON.parse(data.toString()) as Har;

    return har;
  } catch (error) {
    console.error('Error reading HAR file:', error);
  }

  // On error return empty Har object
  return { log: harLog };
}

/**
 * Loads a HAR file, filters it, and saves the filtered result to a new file.
 *
 * @param {string} inputFilePath - The path of the input HAR file to load and filter.
 * @param {string} outputFilePath - The path of the output file to save the filtered HAR log.
 * @param {string} method - The HTTP method to filter by.
 * @param {string} endpoint - The endpoint (pathname and search) to filter by, e.g., "/users?id=123".
 * @param {RegExp} [endpointRegex] - Optional regular expression to match the endpoint against.
 * @param {boolean} [ignoreSearch=false] - Optional flag to ignore the search part of the URL when matching endpoints.
 * @param {string} [prefixToRemove] - Optional prefix to remove from the beginning of the `entry.request.path` property before matching the endpoint.
 * @param {boolean} [sanitize] - Optional remove headers and cookies from the har file.
 * @returns {Promise<void>} A Promise that resolves when the filtered HAR log is saved to the output file, or rejects if there's an error.
 */
export async function filterAndSaveHarLog(
  inputFilePath: string,
  outputFilePath: string,
  method: string,
  endpoint: string,
  endpointRegex?: RegExp,
  ignoreSearch = false,
  prefixToRemove?: string,
  sanitize?: boolean,
): Promise<void> {
  try {
    // Load the HAR data from the input file
    const harData = await loadHarData(inputFilePath);

    // Filter the HAR log
    const filteredLog = filterHarLog(harData.log, method, endpoint, endpointRegex, ignoreSearch, prefixToRemove, sanitize);

    // Save the filtered log to the output file
    const filterdHarData = { ...harData, log: filteredLog };
    await fs.writeFile(outputFilePath, JSON.stringify(filterdHarData, null, 2));

    console.log('Filtered HAR log saved successfully.');
  } catch (error) {
    console.error('Error filtering and saving HAR log:', error);
    throw error;
  }
}

/**
 * Appends the given HAR entry to the existing HAR log and saves it to the specified file.
 * If the file does not exist or cannot be read, a new HAR log will be created with the given entry.
 *
 * @param {Entry} entry - The HAR entry to save
 * @param {string} filePath - The path of the file to save the HAR log to
 * @returns {Promise<Har>} The updated HAR object
 */
export async function appendEntryAndSaveHar(entry: Entry, filePath: string): Promise<Har> {
  const har = await loadHarData(filePath);
  har.log.entries.push(entry);

  try {
    await fs.writeFile(filePath, JSON.stringify(har, null, 2));
  } catch (error) {
    console.error('Error writing HAR file:', error);
  }

  return har;
}

const harLog: Log = {
  version: '1.2',
  creator: {
    name: 'ProxyServer',
    version: '1.0',
  },
  entries: [],
};
