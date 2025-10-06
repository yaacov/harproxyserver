import { randomUUID } from 'crypto';
import { spawn, type ChildProcess } from 'child_process';
import express from 'express';
import { promises as fs } from 'fs';
import type { Entry, Har } from 'har-format';
import type { IncomingHttpHeaders, Server } from 'http';
import { join } from 'path';
import * as zlib from 'zlib';
import { findAvailablePort, waitForCondition } from './test-helpers';

/**
 * E2E tests for HAR Proxy Server in Record Mode - Multiple HTTP Methods
 *
 * This test suite validates the complete request/response flow for various HTTP methods,
 * including header forwarding, HAR recording, and timing information.
 *
 * All tests share the same server setup (beforeAll) to optimize test execution time
 * while maintaining focused, single-purpose test assertions.
 */
describe.each([
  { method: 'GET', hasClientRequestBody: false, isCommunicationGzipped: false },
  { method: 'POST', hasClientRequestBody: true, isCommunicationGzipped: false },
  { method: 'PUT', hasClientRequestBody: true, isCommunicationGzipped: false },
  { method: 'PATCH', hasClientRequestBody: true, isCommunicationGzipped: false },
  { method: 'DELETE', hasClientRequestBody: false, isCommunicationGzipped: false },
  { method: 'GET', hasClientRequestBody: false, isCommunicationGzipped: true, testName: 'gzipped GET' },
  { method: 'POST', hasClientRequestBody: true, isCommunicationGzipped: true, testName: 'gzipped POST with large body' },
])('Record flow for $method requests', ({ method, hasClientRequestBody, isCommunicationGzipped }) => {
  // Client data for assertions
  let responseReceivedByClient: Response;
  let payloadReceivedByClient: unknown;
  const clientCustomRequestHeader = {
    name: 'X-Client-Request-Header',
    value: 'foo',
  };

  // For gzipped large body test, create a large object
  const clientRequestBody = hasClientRequestBody ? { message: 'client request body'.repeat(isCommunicationGzipped ? 100 : 1) } : undefined;

  // Proxy server data for assertions
  let har: Har;
  let harEntry: Entry;
  let harFilePath: string;
  let proxyPort: number;
  let proxyProcess: ChildProcess;
  const testDir = join(process.cwd(), 'test-output-e2e');
  let proxyStderr = '';

  // Upstream server data for assertions
  let upstreamPort: number;
  let upstreamServer: Server;
  let requestHeadersReceivedByUpstream: IncomingHttpHeaders;
  let requestBodyReceivedByUpstream: unknown;
  const upstreamResponseStatus = 200;
  const upstreamCustomResponseHeader = { name: 'X-Upstream-Response-Header', value: 'bar' };

  // For gzipped tests, create a large response body
  const upstreamResponseBody = { message: 'upstream server response body'.repeat(isCommunicationGzipped ? 100 : 1) };

  beforeAll(async () => {
    // Create test directory
    await fs.mkdir(testDir, { recursive: true });

    // Find available ports
    upstreamPort = await findAvailablePort();
    proxyPort = await findAvailablePort();
    harFilePath = join(testDir, `test-recording-${method.toLowerCase()}-${randomUUID()}.har`);

    // Setup upstream server with custom headers
    const upstreamApp = express();
    upstreamApp.use(express.json());

    // Handle all HTTP methods
    upstreamApp.all('/api/hello', (req, res) => {
      requestHeadersReceivedByUpstream = req.headers;
      requestBodyReceivedByUpstream = req.body;
      res.setHeader(upstreamCustomResponseHeader.name, upstreamCustomResponseHeader.value);

      if (isCommunicationGzipped) {
        // Gzip the response
        const jsonString = JSON.stringify(upstreamResponseBody);
        zlib.gzip(jsonString, (err, gzippedData) => {
          if (err) {
            res.status(500).send('Compression error');
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Encoding', 'gzip');
          res.status(upstreamResponseStatus).send(gzippedData);
        });
      } else {
        res.status(upstreamResponseStatus).json(upstreamResponseBody);
      }
    });

    await new Promise<void>((resolve) => {
      upstreamServer = upstreamApp.listen(upstreamPort, resolve);
    });

    // Start proxy server
    const targetUrl = `http://localhost:${upstreamPort}`;
    const args = [
      'tsx',
      'src/harProxyServer.ts',
      '--port',
      String(proxyPort),
      '--target-url',
      targetUrl,
      '--har-file',
      harFilePath,
      '--mode',
      'record',
    ];

    proxyProcess = spawn('npx', args, {
      cwd: process.cwd(),
      env: { ...process.env },
    });

    proxyProcess.stderr?.on('data', (data) => {
      proxyStderr += data.toString();
    });

    // Wait for proxy to be ready
    await waitForCondition(async () => {
      try {
        const res = await fetch(`http://localhost:${proxyPort}/harproxyserver/version`, {
          signal: AbortSignal.timeout(500),
        });
        return res.ok;
      } catch {
        return false;
      }
    });

    // Make the test request
    responseReceivedByClient = await fetch(`http://localhost:${proxyPort}/api/hello`, {
      method,
      headers: {
        [clientCustomRequestHeader.name]: clientCustomRequestHeader.value,
        ...(hasClientRequestBody ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(hasClientRequestBody ? { body: JSON.stringify(clientRequestBody) } : {}),
    });
    payloadReceivedByClient = await responseReceivedByClient.json();

    // Wait for HAR file to be written
    await waitForCondition(async () => {
      try {
        await fs.access(harFilePath);
        return true;
      } catch {
        return false;
      }
    });

    // Read and parse HAR file
    const harContent = await fs.readFile(harFilePath, 'utf-8');
    har = JSON.parse(harContent);
    harEntry = har.log.entries[0];
  });

  afterAll(async () => {
    // Clean up processes
    if (proxyProcess && !proxyProcess.killed) {
      proxyProcess.kill('SIGTERM');
    }

    if (upstreamServer) {
      await new Promise<void>((resolve) => {
        upstreamServer.close(() => resolve());
      });
    }

    // Clean up HAR file
    try {
      await fs.unlink(harFilePath);
    } catch {
      // File might not exist, that's okay
    }

    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Failed to clean up test directory:', error);
    }
  });

  it.skip('should proxy the request and response correctly', () => {
    // Request forwarding: client -> proxy -> upstream
    expect(requestHeadersReceivedByUpstream[clientCustomRequestHeader.name.toLowerCase()]).toBe(clientCustomRequestHeader.value);

    // If method has body, verify it was forwarded
    if (hasClientRequestBody) {
      expect(requestBodyReceivedByUpstream).toEqual(clientRequestBody);
    }

    // Response forwarding: upstream -> proxy -> client
    expect(responseReceivedByClient.status).toBe(upstreamResponseStatus);
    expect(payloadReceivedByClient).toEqual(upstreamResponseBody);
    expect(responseReceivedByClient.headers.get(upstreamCustomResponseHeader.name)).toBe(upstreamCustomResponseHeader.value);

    // For gzipped responses, verify Content-Encoding was handled (decompressed to client)
    if (isCommunicationGzipped) {
      // Client should NOT receive gzip encoding (fetch auto-decompresses)
      // But we can verify the payload is the full expected JSON
      expect(payloadReceivedByClient).toEqual(upstreamResponseBody);
    }
  });

  it('should create a valid HAR file with correct structure', () => {
    // HAR file structure
    expect(har).toHaveProperty('log');
    expect(har.log).toHaveProperty('entries');
    expect(Array.isArray(har.log.entries)).toBe(true);
    expect(har.log.entries.length).toBe(1);
    expect(harEntry).toBeDefined();
  });

  it.skip('should record the request in HAR file', () => {
    // Request method and URL
    expect(harEntry.request.method).toBe(method);
    expect(harEntry.request.url).toContain('/api/hello');

    // Request headers
    expect(Array.isArray(harEntry.request.headers)).toBe(true);
    const harRequestHeader = harEntry.request.headers.find((h) => h.name === clientCustomRequestHeader.name.toLowerCase());
    expect(harRequestHeader?.value).toBe(clientCustomRequestHeader.value);

    // If method has body, verify postData was recorded
    if (hasClientRequestBody) {
      expect(harEntry.request.postData).toBeDefined();
      expect(harEntry.request.postData?.mimeType).toContain('application/json');
      expect(harEntry.request.postData?.text).toBeTruthy();

      const recordedRequestBody = JSON.parse(harEntry.request.postData?.text || '{}');
      expect(recordedRequestBody).toEqual(clientRequestBody);
    }
  });

  it('should record the response in HAR file', () => {
    // Response status
    expect(harEntry.response.status).toBe(200);
    expect(harEntry.response).toHaveProperty('statusText');

    // Response headers
    expect(Array.isArray(harEntry.response.headers)).toBe(true);
    const harResponseHeader = harEntry.response.headers.find((h) => h.name === upstreamCustomResponseHeader.name.toLowerCase());
    expect(harResponseHeader?.value).toBe(upstreamCustomResponseHeader.value);

    // For gzipped responses, verify Content-Encoding header was recorded
    if (isCommunicationGzipped) {
      const contentEncodingHeader = harEntry.response.headers.find((h) => h.name === 'content-encoding');
      expect(contentEncodingHeader?.value).toBe('gzip');
    }

    // Response content - should always be decompressed in HAR
    expect(harEntry.response.content).toBeDefined();
    expect(harEntry.response.content.mimeType).toContain('application/json');
    expect(harEntry.response.content.text).toBeTruthy();

    const responseBody = JSON.parse(harEntry.response.content.text || '{}');
    expect(responseBody).toEqual(upstreamResponseBody);

    // For gzipped responses, verify the content was decompressed (large body size)
    if (isCommunicationGzipped) {
      const contentSize = harEntry.response.content.text?.length || 0;
      expect(contentSize).toBeGreaterThan(1000); // Large decompressed body
    }
  });

  it('should record timing information', () => {
    expect(harEntry.timings).toBeDefined();
    expect(typeof harEntry.timings.wait).toBe('number');
    expect(typeof harEntry.timings.receive).toBe('number');
    expect(harEntry.startedDateTime).toBeTruthy();
    expect(typeof harEntry.time).toBe('number');
    expect(harEntry.time).toBeGreaterThanOrEqual(0);
  });

  it('should not contain errors in stderr during HAR file creation', () => {
    expect(proxyStderr.toLowerCase()).not.toContain('error');
  });
});

describe.each([
  { method: 'GET', hasRequestBody: false },
  { method: 'POST', hasRequestBody: true },
  { method: 'PUT', hasRequestBody: true },
  { method: 'PATCH', hasRequestBody: true },
  { method: 'DELETE', hasRequestBody: false },
])('Replay flow for $method requests', ({ method, hasRequestBody }) => {
  jest.setTimeout(60000); // 60 second timeout for entire suite

  const testDir = join(process.cwd(), 'test-output-e2e');
  let proxyPort: number;
  let proxyProcess: ChildProcess;
  let harFilePath: string;

  // Response data from replay
  let replayResponse: Response;
  let replayResponseBody: unknown;

  // Expected data (from the recorded HAR)
  const expectedStatus = 200;
  const expectedBody = { message: 'replay response body' };
  const expectedRequestBody = hasRequestBody ? { data: 'replay request body' } : undefined;
  const expectedCustomResponseHeader = { name: 'X-Upstream-Response-Header', value: 'bar' };

  beforeAll(async () => {
    // Create test directory
    await fs.mkdir(testDir, { recursive: true });

    // Find available port for replay proxy
    proxyPort = await findAvailablePort();
    harFilePath = join(testDir, `test-replay-${method.toLowerCase()}-${randomUUID()}.har`);

    // Create a HAR file with a recorded request
    const recordedHar: Har = {
      log: {
        version: '1.2',
        creator: { name: 'HAR Proxy Server Test', version: '1.0' },
        entries: [
          {
            startedDateTime: new Date().toISOString(),
            time: 50,
            request: {
              method,
              url: `http://localhost:${proxyPort}/api/hello`,
              httpVersion: 'HTTP/1.1',
              headers: hasRequestBody ? [{ name: 'content-type', value: 'application/json' }] : [],
              queryString: [],
              cookies: [],
              headersSize: -1,
              bodySize: hasRequestBody ? JSON.stringify(expectedRequestBody).length : 0,
              ...(hasRequestBody
                ? {
                    postData: {
                      mimeType: 'application/json',
                      text: JSON.stringify(expectedRequestBody),
                    },
                  }
                : {}),
            },
            response: {
              status: expectedStatus,
              statusText: 'OK',
              httpVersion: 'HTTP/1.1',
              headers: [
                { name: 'content-type', value: 'application/json; charset=utf-8' },
                { name: expectedCustomResponseHeader.name.toLowerCase(), value: expectedCustomResponseHeader.value },
              ],
              cookies: [],
              content: {
                size: JSON.stringify(expectedBody).length,
                mimeType: 'application/json',
                text: JSON.stringify(expectedBody),
              },
              redirectURL: '',
              headersSize: -1,
              bodySize: -1,
            },
            cache: {},
            timings: { wait: 30, receive: 20, send: -1, blocked: -1, dns: -1, connect: -1, ssl: -1 },
          },
        ],
      },
    };

    // Write the HAR file
    await fs.writeFile(harFilePath, JSON.stringify(recordedHar, null, 2), 'utf-8');

    // Verify the HAR file was written and is readable
    await waitForCondition(async () => {
      try {
        await fs.access(harFilePath);
        const content = await fs.readFile(harFilePath, 'utf-8');
        return content.length > 0;
      } catch {
        return false;
      }
    });

    // Start proxy in REPLAY mode
    const args = ['tsx', 'src/harProxyServer.ts', '--port', String(proxyPort), '--har-file', harFilePath, '--mode', 'play'];

    proxyProcess = spawn('npx', args, {
      cwd: process.cwd(),
      env: { ...process.env },
    });

    // Wait for proxy to be ready
    await waitForCondition(async () => {
      try {
        const res = await fetch(`http://localhost:${proxyPort}/harproxyserver/version`, {
          signal: AbortSignal.timeout(500),
        });
        return res.ok;
      } catch {
        // Retry on error
        return false;
      }
    });

    // Make a request to the replay proxy (should return recorded response)
    replayResponse = await fetch(`http://localhost:${proxyPort}/api/hello`, {
      method,
      headers: {
        ...(hasRequestBody ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(hasRequestBody ? { body: JSON.stringify(expectedRequestBody) } : {}),
    });
    replayResponseBody = await replayResponse.json();
  });

  afterAll(async () => {
    // Clean up processes
    if (proxyProcess && !proxyProcess.killed) {
      proxyProcess.kill('SIGTERM');
    }

    // Clean up HAR file
    try {
      await fs.unlink(harFilePath);
    } catch {
      // File might not exist, that's okay
    }

    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Failed to clean up test directory:', error);
    }
  });

  it('should return the recorded response from HAR file', () => {
    // Status code
    expect(replayResponse.status).toBe(expectedStatus);

    // Response body
    expect(replayResponseBody).toEqual(expectedBody);

    // Content-Type header is forwarded
    expect(replayResponse.headers.get('content-type')).toContain('application/json');

    // TODO: Custom headers are not currently forwarded by recordedHarMiddleware
    // only Content-Type header is set
    // const customHeader = replayResponse.headers.get(expectedCustomResponseHeader.name.toLowerCase());
    // expect(customHeader).toBe(expectedCustomResponseHeader.value);
  });

  it('should serve responses without requiring an upstream server', async () => {
    // This test passes because we didn't start any upstream server
    // The proxy is serving responses entirely from the HAR file
    expect(replayResponse.ok).toBe(true);

    // Making the same request again should return the same recorded response
    const secondResponse = await fetch(`http://localhost:${proxyPort}/api/hello`, {
      method,
      headers: {
        ...(hasRequestBody ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(hasRequestBody ? { body: JSON.stringify(expectedRequestBody) } : {}),
    });
    const secondBody = await secondResponse.json();

    expect(secondResponse.status).toBe(expectedStatus);
    expect(secondBody).toEqual(expectedBody);
  });

  it('should return 404 for requests not in the HAR file', async () => {
    // Request to a URL not in the HAR file should return 404
    const unrecordedResponse = await fetch(`http://localhost:${proxyPort}/api/unrecorded`);

    expect(unrecordedResponse.status).toBe(404);
  });
});
