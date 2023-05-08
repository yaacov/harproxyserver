import { filterHarLog, findHarEntry } from '../harUtils';
import { harUtilsData as har } from './harUtils.data';

describe('findHarEntry', () => {
  it('should return null when given a null or undefined log', () => {
    expect(findHarEntry(null, 'GET', '/users?id=123')).toBeNull();
    expect(findHarEntry(undefined, 'GET', '/users?id=123')).toBeNull();
  });

  it('should find the correct entry when given an exact match', () => {
    const entry = findHarEntry(har.log, 'GET', '/users?id=456');
    expect(entry).toBeDefined();
    expect(entry?.request.method).toBe('GET');
    expect(entry?.request.url).toBe('https://example.com/users?id=456');
  });

  it('should ignore the search part of the URL if ignoreSearch flag is set', () => {
    const entry = findHarEntry(har.log, 'GET', '/users', undefined, true);
    expect(entry).toBeDefined();
    expect(entry?.request.method).toBe('GET');
    expect(entry?.request.url).toBe('https://example.com/users?id=123');
  });

  it('should remove the prefix before matching the endpoint if prefixToRemove is set', () => {
    const entry = findHarEntry(har.log, 'GET', '/users?id=456', undefined, false, '/some/prefix');
    expect(entry).toBeDefined();
    expect(entry?.request.method).toBe('GET');
    expect(entry?.request.url).toBe('https://example.com/some/prefix/users?id=456');
  });

  it('should find the correct entry when given a regex to match the endpoint', () => {
    const entry = findHarEntry(har.log, 'GET', '', /^\/users[?]id=4\d+/, false);
    expect(entry).toBeDefined();
    expect(entry?.request.method).toBe('GET');
    expect(entry?.request.url).toBe('https://example.com/users?id=456');
  });

  it('should return null when no matching entry is found', () => {
    expect(findHarEntry(har.log, 'PUT', '/users?id=123')).toBeNull();
  });
});

describe('filterHarLog', () => {
  it('should return a filtered HAR log with matching entries', () => {
    const filteredLog = filterHarLog(har.log, 'GET', '/users?id=123');

    expect(filteredLog.entries.length).toBe(1);
    expect(filteredLog.entries[0].request.method).toBe('GET');
    expect(filteredLog.entries[0].request.url).toBe('https://example.com/users?id=123');
  });

  it('should return an empty log if no matching entries are found', () => {
    const filteredLog = filterHarLog(har.log, 'POST', '/users');

    expect(filteredLog.entries.length).toBe(0);
  });

  it('should return an empty log if the input HAR log is null', () => {
    const filteredLog = filterHarLog(null, 'GET', '/users');

    expect(filteredLog.entries.length).toBe(0);
  });

  it('should return an empty log if the input HAR log is undefined', () => {
    const filteredLog = filterHarLog(undefined, 'GET', '/users');

    expect(filteredLog.entries.length).toBe(0);
  });

  it('should return a filtered HAR log with matching entries when ignoreSearch is true', () => {
    const filteredLog = filterHarLog(har.log, 'GET', '/users', undefined, true);

    expect(filteredLog.entries.length).toBe(2);
    expect(filteredLog.entries[0].request.method).toBe('GET');
    expect(filteredLog.entries[0].request.url).toBe('https://example.com/users?id=123');
  });
});
