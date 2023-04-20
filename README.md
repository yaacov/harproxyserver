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

## Installation

To install the server as a global command-line utility:

```bash
npm install --location=global harproxyserver
```

# Usage

## API

harproxyserver / [Exports](doc/modules.md)

## Standalone Executable

Run the server using the harServer command:

Start the server in play mode (default)

``` bash
harproxyserver -p 3000 -f recorded.har
```

Start the server in record mode

``` bash
harproxyserver -p 3000 -t http://example.com -f recorded.har -m record
```

Start the server with HTTPS

``` bash
harproxyserver -p 3000 -f recorded.har --tls --key-file server.key --cert-file serv
```

# In Your Project

Import the server and utility functions in your project:

``` ts
import { findHarEntry, recordedHarMiddleware } from 'harproxyserver';
```

# Command-Line Options

The available options for this tool are:

  - --port, -p <number>: The port the server will listen on (default: 3000).
  - --target-url, -t <url>: The target URL to proxy when in 'record' mode.
  - --har-file, -f <file>: The file path to save the HAR file (default: recording-[date and time].har).
  - --prefix <string>: The prefix for the HAR playback endpoint (default: '').
  - --mode, -m <string>: The mode to run the server in (default: 'play'). Choices are 'play' or 'record'.
  - --tls: Run the server in secure mode (HTTPS) (default: false).
  - --key-file <file>: Path to the TLS private key file (required when using --tls).
  - --cert-file <file>: Path to the TLS certificate file (required when using --tls).

# License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
