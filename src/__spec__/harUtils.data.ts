import { Entry, Har } from 'har-format';

const getEntry = (method: string, url: string): Entry => {
  const entry: Entry = {
    startedDateTime: '2023-04-17T10:05:00.000Z',
    time: 100,
    request: {
      method: 'GET',
      url: 'https://example.com/users?id=123',
      httpVersion: 'HTTP/1.1',
      headers: [
        {
          name: 'User-Agent',
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.12345.67 Safari/537.36',
        },
      ],
      queryString: [],
      cookies: [],
      headersSize: -1,
      bodySize: -1,
    },
    response: {
      status: 200,
      statusText: 'OK',
      httpVersion: 'HTTP/1.1',
      headers: [
        {
          name: 'Content-Type',
          value: 'text/plain',
        },
      ],
      cookies: [],
      content: {
        size: 13,
        mimeType: 'text/plain',
        text: 'Test response',
      },
      redirectURL: '',
      headersSize: -1,
      bodySize: -1,
    },
    cache: {},
    timings: {
      wait: 0,
      receive: 0,
    },
    serverIPAddress: '',
    connection: '',
    comment: '',
  };

  return {
    ...entry,
    request: {
      ...entry.request,
      method,
      url,
    },
  };
};

export const harUtilsData: Har = {
  log: {
    version: '1.2',
    entries: [
      getEntry('GET', 'https://example.com/users?id=123'),
      getEntry('POST', 'https://example.com/login'),
      getEntry('GET', 'https://example.com/users?id=456'),
      getEntry('GET', 'https://example.com/some/prefix/users?id=456'),
    ],
    creator: {
      name: '',
      version: '',
    },
  },
};
