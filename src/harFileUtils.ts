import fs from 'fs/promises';

import { Entry, Har, Log } from 'har-format';

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
