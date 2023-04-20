import { findHarEntry } from '../harUtils';
import { testHar } from './testHar';

describe('findHarEntry', () => {
  it('should return the matching entry', () => {
    const method = 'GET';
    const path = '/test';
    const expectedEntry = testHar.log.entries[0];
    const actualEntry = findHarEntry(testHar.log, method, path);
    expect(actualEntry).toEqual(expectedEntry);
  });

  it('should return null if no matching entry is found', () => {
    const method = 'PUT';
    const path = '/test';
    const actualEntry = findHarEntry(testHar.log, method, path);
    expect(actualEntry).toBeNull();
  });
});
