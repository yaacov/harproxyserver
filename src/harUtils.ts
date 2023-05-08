import { Entry, Har, Header, Log } from 'har-format';
import { StatusCodes } from 'http-status-codes';

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
 * Finds the HAR entry in the given log with the matching HTTP method and endpoint.
 *
 * @param {Log} harLog - The HAR log to search through.
 * @param {string} method - The HTTP method of the desired entry.
 * @param {string} endpoint - The endpoint (pathname and search) of the desired entry, e.g., "/users?id=123".
 * @param {RegExp} [endpointRegex] - Optional regular expression to match the endpoint against. For example, to match endpoints that start with "/users" followed by a number, use `/^\/users\d+/`.
 * @param {boolean} [ignoreSearch=false] - Optional flag to ignore the search part of the URL when matching endpoints.
 * @param {string} [prefixToRemove] - Optional prefix to remove from the beginning of the `entry.request.path` property before matching the endpoint.
 * @returns {Entry | null} The matching HAR entry if found, or null if not found.
 */
export function findHarEntry(
  harLog: Log | undefined | null,
  method: string,
  endpoint: string,
  endpointRegex?: RegExp,
  ignoreSearch = false,
  prefixToRemove?: string,
): Entry | null {
  if (!harLog) {
    return null;
  }

  const normalizedMethod = method.toUpperCase();
  const normalizedEndpoint = endpoint || '/';

  const matchingEntry = harLog.entries.find((entry) => {
    const urlObject = getValidUrl(entry);
    if (!urlObject) {
      return false; // skip this entry if URL is malformed
    }

    let entryEndpoint: string | null = ignoreSearch ? urlObject.pathname : `${urlObject.pathname}${urlObject.search}`;

    entryEndpoint = removePrefixIfNeeded(entryEndpoint, prefixToRemove);
    if (!entryEndpoint) {
      return false; // skip this entry if entryEndpoint is null (meaning it doesn't start with prefixToRemove)
    }

    const methodMatch = entry.request.method.toUpperCase() === normalizedMethod;
    const endpointMatch = endpointRegex ? entryEndpoint.match(endpointRegex) : entryEndpoint === normalizedEndpoint;

    return methodMatch && endpointMatch;
  });

  return matchingEntry || null;
}

/**
 * Filters a HAR log and returns a filtered HAR log based on the specified inputs.
 *
 * @param {Log | undefined | null} harLog - The HAR log to filter.
 * @param {string} method - The HTTP method to filter by.
 * @param {string} endpoint - The endpoint (pathname and search) to filter by, e.g., "/users?id=123".
 * @param {RegExp} [endpointRegex] - Optional regular expression to match the endpoint against.
 * @param {boolean} [ignoreSearch=false] - Optional flag to ignore the search part of the URL when matching endpoints.
 * @param {string} [prefixToRemove] - Optional prefix to remove from the beginning of the `entry.request.path` property before matching the endpoint.
 * @param {boolean} [sanitize] - Optional remove headers and cookies from the har file.
 * @returns {Log} The filtered HAR log. If no matching entries are found, an empty log will be returned.
 */
export function filterHarLog(
  harLog: Log | undefined | null,
  method: string,
  endpoint: string,
  endpointRegex?: RegExp,
  ignoreSearch = false,
  prefixToRemove?: string,
  sanitize?: boolean,
): Log {
  const filteredLog: Log = {
    ...(harLog as Log),
    entries: [],
  };

  if (!harLog) {
    return filteredLog;
  }

  const normalizedMethod = method.toUpperCase();
  const normalizedEndpoint = endpoint || '/';

  for (const entry of harLog.entries) {
    const urlObject = getValidUrl(entry);
    if (!urlObject) {
      continue; // skip this entry if URL is malformed
    }

    let entryEndpoint: string | null = ignoreSearch ? urlObject.pathname : `${urlObject.pathname}${urlObject.search}`;

    entryEndpoint = removePrefixIfNeeded(entryEndpoint, prefixToRemove);
    if (!entryEndpoint) {
      continue; // skip this entry if entryEndpoint is null (meaning it doesn't start with prefixToRemove)
    }

    const methodMatch = entry.request.method.toUpperCase() === normalizedMethod;
    const endpointMatch = endpointRegex ? entryEndpoint.match(endpointRegex) : entryEndpoint === normalizedEndpoint;

    if (methodMatch && endpointMatch) {
      if (sanitize) {
        filteredLog.entries.push({
          ...entry,
          _initiator: undefined,
          request: {
            ...entry.request,
            headers: [],
            cookies: [],
          },
          response: {
            ...entry.response,
            headers: [],
            cookies: [],
          },
        });
      } else {
        filteredLog.entries.push(entry);
      }
    }
  }

  return filteredLog;
}

/**
 * Type for the parameter object of the createHarEntryFromText function.
 */
export type HarEntryParams = {
  /** The base URL of the request (example: 'https://example.com'). */
  baseUrl: string;

  /** The endpoint of the request (example: '/book/story/?page=4'). */
  endpoint: string;

  /** The text of the response body. */
  text: string;

  /** The MIME type of the response body (default: 'application/json'). Optional. */
  mimeType?: string;

  /** The HTTP method used for the request (default: 'GET'). Optional. */
  requestMethod?: string;

  /** The HTTP status code of the response (default: StatusCodes.OK). Optional. */
  statusCode?: number;

  /** The response headers (default: an empty array). Optional. */
  headers?: Header[];
};

/**
 * Creates a HAR (HTTP Archive) entry object from the given input parameters.
 *
 * @param {HarEntryParams} params - The parameters for creating the HAR entry.
 * @returns {Entry} The generated HAR entry object.
 */
export function createHarEntryFromText(params: HarEntryParams): Entry {
  return {
    startedDateTime: new Date().toISOString(),
    cache: {},
    request: {
      method: params.requestMethod || 'GET',
      url: `${params.baseUrl}${params.endpoint}`,
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headers: [],
      queryString: [],
      headersSize: -1,
      bodySize: -1,
    },
    response: {
      status: params.statusCode || StatusCodes.OK,
      statusText: '',
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headers: params.headers || [],
      content: {
        size: params.text.length,
        text: params.text,
        mimeType: params.mimeType || 'application/json',
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
 * Returns a URL object if the given entry has a valid URL, otherwise returns null.
 * @param {Entry} entry - The HAR entry to check.
 * @returns {URL | null} - A URL object if the URL is valid, null otherwise.
 */
function getValidUrl(entry: Entry): URL | null {
  try {
    const urlObject = new URL(entry.request.url);
    return urlObject;
  } catch (error) {
    return null;
  }
}

/**
 * Removes the prefix from the entry's endpoint if needed.
 * @param {string} entryEndpoint - The entry's endpoint.
 * @param {string} prefixToRemove - The prefix to remove from the endpoint.
 * @returns {string | null} - The modified endpoint or null if the entryEndpoint doesn't start with the prefix.
 */
function removePrefixIfNeeded(entryEndpoint: string, prefixToRemove?: string): string | null {
  if (prefixToRemove) {
    if (entryEndpoint.startsWith(prefixToRemove)) {
      return entryEndpoint.slice(prefixToRemove.length);
    }
    return null;
  }
  return entryEndpoint;
}
