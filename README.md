# HAR Server

HAR Server is a simple proxy server that records and plays back HTTP requests and responses in [HAR format](http://www.softwareishard.com/blog/har-12-spec/). It can be used as a standalone executable or integrated into other projects as an npm package.

## Features

- Proxy requests and responses to a target URL
- Record and save requests and responses in HAR format
- Playback recorded requests and responses from a HAR file
- Configurable playback endpoint prefix
- Command-line interface for easy configuration

## Installation

To install the server as a global command-line utility:

```bash
npm install -g your-package-name
```

# Usage

## Standalone Executable

Run the server using the harServer command:

``` bash
harServer --target-url http://example.com --har-file example.har --mode record --prefix /har
```

# In Your Project

Import the server and utility functions in your project:

``` bash
import { initHarLog, recordHandler, playHandler, initServer } from 'your-package-name';
```

# Command-Line Options

  -  --target-url: The target URL to proxy requests (required)
  -  --har-file: The HAR file name to save the log (optional, default: recording-<date and time>.har)
  -  --mode: The server mode, either 'record' or 'play' (required)
  -  --prefix: The prefix for the HAR playback endpoint (optional, default: '')

# API

## Utility Functions

  -  `initHarLog(harFilePath: string)`: Initialize a new HAR log file
  -  `saveHarEntry(entry: Har.Entry, harFilePath: string)`: Save a HAR entry to the log file
  -  `recordHandler(targetUrl: string, harFilePath: string)`: Middleware function for recording requests and responses
  -  `playHandler(harFilePath: string, prefix: string)`: Middleware function for playing back requests and responses from a HAR file
  -  `initServer(argv: any)`: Initialize and run the server with command-line options

# License

Apache License 2.0