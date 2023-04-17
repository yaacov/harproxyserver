import fs from 'fs';
import type { IncomingHttpHeaders } from 'http';

import type { Entry, Har, Header, Log } from 'har-format';

const harLog: Log = {
  version: '1.2',
  creator: {
    name: 'ProxyServer',
    version: '1.0',
  },
  entries: [],
};

/**
 * Appends the given HAR entry to the existing HAR log and saves it to the specified file.
 *
 * @param request The HAR entry to save.
 * @param fileName The name of the file to save the HAR log to.
 */
export function saveHarLog(request: Entry, fileName: string) {
  harLog.entries.push(request);
  const har: Har = { log: harLog };
  fs.writeFileSync(fileName, JSON.stringify(har, null, 2));
}

/**
 * Converts the given incoming headers to HAR format.
 *
 * @param incomingHeaders The incoming headers to convert.
 * @returns An array of headers in HAR format.
 */
export function convertToHarHeaders(incomingHeaders: IncomingHttpHeaders): Header[] {
  const harHeaders: Header[] = [];

  for (const [name, value] of Object.entries(incomingHeaders)) {
    if (Array.isArray(value)) {
      for (const val of value) {
        harHeaders.push({ name, value: val });
      }
    } else {
      harHeaders.push({ name, value: value || '' });
    }
  }

  return harHeaders;
}