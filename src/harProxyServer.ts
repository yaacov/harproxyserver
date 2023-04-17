import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { recordedHarMiddleware } from './recordedHarMiddleware';
import { recorderHarMiddleware } from './recorderHarMiddleware';

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
      demandOption: true,
    },
    'har-file': {
      alias: 'f',
      type: 'string',
      description: 'The file path to save the HAR file',
      default: 'file.har',
    },
    mode: {
      alias: 'm',
      type: 'string',
      description: 'The mode to run the server in (play or record)',
      choices: ['play', 'record'],
      default: 'proxy',
    },
    help: {
      alias: 'h',
      description: 'Show help',
    },
  })
  .parseSync();

const targetUrl = argv['target-url'];
const harFile = argv['har-file'];
const app = express();
const port = argv['port'];
const prefix = argv['prefix'];
const mode = argv['mode'];

/**
 * Set up the server based on the selected mode.
 */
switch(mode) {
case 'play': {
  /**
   * Use the recorded HAR middleware to serve HAR data.
   */
  app.use(`${prefix}/`, recordedHarMiddleware(harFile));
  break;
}
case 'record': {
  /**
   * Custom handler for proxy response.
   *
   * @param {http.IncomingMessage} proxyRes - The response from the target server
   * @param {http.ServerResponse} res - The server response to the client
   * @param {http.ClientRequest} req - The client request
   */
  const onProxyResHandler = recorderHarMiddleware(targetUrl, harFile);

  /**
   * Set up the proxy middleware to forward requests to the target server.
   */
  app.use(
    '/',
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      selfHandleResponse: true,
      onProxyRes: onProxyResHandler,
    })
  );
  break;
}
}

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});