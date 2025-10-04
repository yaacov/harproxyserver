#!/usr/bin/env node

import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer as createHttpsServer } from 'https';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { exit } from 'process';
import { readFileSync } from 'fs';
import { appendEntryAndSaveHar, filterAndSaveHarLog, loadHarData } from './harFileUtils';
import { recordedHarMiddleware } from './recordedHarMiddleware';
import { recorderHarMiddleware } from './recorderHarMiddleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load package.json at runtime to avoid circular dependency issues
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const argv = yargs(hideBin(process.argv))
  .options({
    port: {
      alias: 'p',
      type: 'number',
      description: 'The port to listen on',
      default: 3000,
    },
    'target-url': {
      alias: 't',
      type: 'string',
      description: 'The target URL to proxy',
    },
    'har-file': {
      alias: 'f',
      type: 'string',
      description: 'The file path to save the HAR file (default: recording-[date and time].har)',
    },
    prefix: {
      type: 'string',
      description: 'The prefix for the HAR playback endpoint',
      default: '',
    },
    mode: {
      alias: 'm',
      type: 'string',
      description: 'The mode to run the server in (play, record or filter)',
      choices: ['play', 'record', 'filter'],
      default: 'play',
    },
    tls: {
      type: 'boolean',
      description: 'Run the server in secure mode (HTTPS)',
      default: false,
    },
    'key-file': {
      type: 'string',
      description: 'Path to the TLS private key file',
    },
    'cert-file': {
      type: 'string',
      description: 'Path to the TLS certificate file',
    },
    'filter-endpoint-regexp': {
      type: 'string',
      description: 'RegExp to use when filtering a har file (filtered har file will include only matching endpoints)',
    },
    sanitize: {
      type: 'boolean',
      description: 'Remove headers and cookies when filtering a har file',
    },
    secure: {
      type: 'boolean',
      description: 'Enable/disable SSL certificate verification',
    },
  })
  .version('version', 'Show version and app information', `App: ${pkg.name}\nVersion: ${pkg.version}\nDescription: ${pkg.description}`)
  .help('h')
  .alias('h', 'help')
  .parseSync();

// Check if target-url is provided when required
if (argv.mode === 'record' && !argv['target-url']) {
  console.error("Error: --target-url is required when --mode is 'record'");
  process.exit(1);
}

// Set the default HAR file name after argument parsing
const dateAndTime = new Date();
const defaultHarFileName = `recording-${dateAndTime.toISOString().replace(/[:.]/g, '-')}.har`;

// Sanity check for CLI arguments
const targetUrl = argv['target-url'] || '';
const harFile = argv['har-file'] || defaultHarFileName;

const app = express();

// This route returns the application's name, version, and description as a JSON object.
app.get('/harproxyserver/version', (req, res) => {
  res.json({
    app: pkg.name,
    version: pkg.version,
    description: pkg.description,
  });
});

// Set up the server based on the selected mode.
switch (argv.mode) {
  case 'filter': {
    const endpointRegex = RegExp(argv['filter-endpoint-regexp'] as string);
    filterAndSaveHarLog(harFile, `${harFile}.filtered.har`, 'GET', '', endpointRegex, true, undefined, argv.sanitize).then(() => exit());

    break;
  }
  case 'play': {
    app.use(`/${argv.prefix}*`, recordedHarMiddleware(harFile, loadHarData, argv.prefix));
    break;
  }
  case 'record': {
    const onProxyResHandler = recorderHarMiddleware(harFile, appendEntryAndSaveHar, targetUrl);

    app.use(
      '/',
      createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        selfHandleResponse: true,
        on: {
          proxyRes: onProxyResHandler,
        },
        secure: argv.secure,
      }),
    );
    break;
  }
}

// Create HTTP or HTTPS server based on the CLI options
const createServer = () => {
  if (argv.tls) {
    if (!argv['key-file'] || !argv['cert-file']) {
      console.error('Error: Both --key-file and --cert-file must be provided when using --tls');
      process.exit(1);
    }
    const privateKey = readFileSync(argv['key-file'], 'utf8');
    const certificate = readFileSync(argv['cert-file'], 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    return createHttpsServer(credentials, app);
  } else {
    return createHttpServer(app);
  }
};

const server = createServer();
server.listen(argv.port, () => {
  const protocol = argv.tls ? 'https' : 'http';
  console.log(`Proxy server listening at ${protocol}://localhost:${argv.port}`);
});
