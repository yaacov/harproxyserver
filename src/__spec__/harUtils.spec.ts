import { findHarEntry } from '../harUtils';
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
