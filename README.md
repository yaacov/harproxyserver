[![npm version](https://badge.fury.io/js/harproxyserver.svg)](https://badge.fury.io/js/harproxyserver)

# HAR Proxy Server

HAR Proxy Server is a simple proxy server that records and plays back HTTP requests and responses in [HAR format](http://www.softwareishard.com/blog/har-12-spec/). It can be used as a standalone executable or integrated into other projects as an npm package.

## Features

- Record HTTP requests and responses to a HAR file.
- Playback recorded requests and responses from a HAR file
- Serve requests over HTTP or HTTPS.
- Configurable playback endpoint prefix
- Middleware support for Express.js.
- Command-line interface for easy configuration
- Utility to filter HAR files to extract only required HTTP/S requiests.
- Utility to sanitize headers and cookies from har files

## Installation

To install the server as a global command-line utility:

```bash
npm install --location=global harproxyserver
```

# Usage

## Standalone Executable

Run the server using the harServer command:

Start the server in play mode (default)

```bash
harproxyserver -p 3000 -f recorded.har
```

Start the server in record mode

```bash
harproxyserver -p 3000 -t http://example.com -f recorded.har -m record
```

Start the server with HTTPS

```bash
harproxyserver -p 3000 -f recorded.har --tls --key-file server.key --cert-file serv
```

Filter HAR file, to return only requests containing "forklift.konveyor.io" or "forklift-console-plugin"
in the URL.

```bash
harproxyserver -m filter -f recorded.har --filter-endpoint-regexp "forklift.konveyor.io|forklift-console-plugin"
```

## Development build

Before running the code from source, compile it using, `npm run build`, the compiled sources will be added to the `dist` directory.

```bash
# Compile development code
npm run build

# Run development code
node dist/harProxyServer.js [options ...]
```

## API

Import the server and utility functions in your TypeScript project:

```ts
import { findHarEntry, getRecordedHarMiddleware } from 'harproxyserver';
```

Example 1: Using findHarEntry to find a specific GET request in a HAR log:

```ts
const harLog = ... // retrieve HAR log
const method = 'GET';
const pathname = '/api';

const entry = findHarEntry(harLog, method, pathname);

if (entry) {
  console.log(`Found entry with ID ${entry.id}`);
} else {
  console.log('Entry not found');
}
```

Example 2: Using findHarEntry to find a POST request with specific query parameters:

```ts
const harLog = ... // retrieve HAR log
const method = 'POST';
const baseUrl = 'https://example.com/api';
const queryParams = { q: 'search term', page: 1 };

const url = new URL(baseUrl);
for (const [key, value] of Object.entries(queryParams)) {
  url.searchParams.set(key, value);
}
const pathnameWithParams = `${url.pathname}${url.search};

const entry = findHarEntry(harLog, method, pathnameWithParams);

if (entry) {
  console.log(`Found entry with ID ${entry.id}`);
} else {
  console.log('Entry not found');
}
```

# Command-Line Options

The available options for this tool are:

- --port, -p <number>: The port the server will listen on (default: 3000).
- --target-url, -t <url>: The target URL to proxy when in 'record' mode.
- --har-file, -f <file>: The file path to save the HAR file (default: recording-[date and time].har).
- --prefix <string>: The prefix for the HAR playback endpoint (default: '').
- --mode, -m <string>: The mode to run the server in (default: 'play'). Choices are 'play', 'record' or 'filter'.
- --tls: Run the server in secure mode (HTTPS) (default: false).
- --key-file <file>: Path to the TLS private key file (required when using --tls).
- --cert-file <file>: Path to the TLS certificate file (required when using --tls).
- --filter-endpoint-regexp <string>: RegExp to use when filtering a har file (filtered har file will include only matching endpoints)
- --sanitize <boolean>: Remove headers and cookies when filtering a har file
- --secure <boolean>: Enable/disable SSL certificate verification

# License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
