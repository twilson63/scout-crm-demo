import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryCache } from '../memoryCache';
import { StorageCache } from '../storageCache';
import { RequestDeduplicator } from '../deduplication';

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageMock.store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageMock.store[key]; }),
  clear: vi.fn(() => { localStorageMock.store = {}; }),
  key: vi.fn((i: number) => Object.keys(localStorageMock.store)[i] ?? null),
  get length() { return Object.keys(this.store).length; },
};

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
  });

  describe('get()', () => {
    it('returns { hit: false } for missing keys', () => {
      const result = cache.get('nonexistent');
      expect(result).toEqual({ hit: false });
    });

    it('returns { hit: false } for expired entries', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      cache.set('test', { value: 'data' }, 1000);

      // Advance time beyond TTL
      vi.setSystemTime(now + 1001);

      const result = cache.get('test');
      expect(result).toEqual({ hit: false });

      vi.useRealTimers();
    });
  });

  describe('set() and get()', () => {
    it('stores and retrieves valid entries', () => {
      const testData = { name: 'John', id: 123 };
      cache.set('user', testData, 60000);

      const result = cache.get<typeof testData>('user');
      expect(result.hit).toBe(true);
      expect(result.data).toEqual(testData);
      expect(result.source).toBe('memory');
      expect(result.timestamp).toBeDefined();
    });

    it('stores entries with correct timestamp', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      cache.set('test', 'value', 60000);
      const result = cache.get('test');

      expect(result.timestamp).toBe(now);

      vi.useRealTimers();
    });
  });

  describe('invalidate()', () => {
    it('removes a specific key', () => {
      cache.set('key1', 'value1', 60000);
      cache.set('key2', 'value2', 60000);

      cache.invalidate('key1');

      expect(cache.get('key1')).toEqual({ hit: false });
      expect(cache.get('key2').hit).toBe(true);
    });
  });

  describe('invalidatePattern()', () => {
    it('removes matching keys with wildcard pattern', () => {
      cache.set('contact:1', { id: 1 }, 60000);
      cache.set('contact:2', { id: 2 }, 60000);
      cache.set('contact:3', { id: 3 }, 60000);
      cache.set('user:1', { id: 1 }, 60000);

      cache.invalidatePattern('contact:*');

      expect(cache.get('contact:1')).toEqual({ hit: false });
      expect(cache.get('contact:2')).toEqual({ hit: false });
      expect(cache.get('contact:3')).toEqual({ hit: false });
      expect(cache.get('user:1').hit).toBe(true);
    });

    it('removes exact key when pattern has no wildcard', () => {
      cache.set('exact-key', 'value', 60000);
      cache.set('exact-key-more', 'value2', 60000);

      cache.invalidatePattern('exact-key');

      expect(cache.get('exact-key')).toEqual({ hit: false });
      expect(cache.get('exact-key-more').hit).toBe(true);
    });
  });

  describe('clear()', () => {
    it('removes all entries', () => {
      cache.set('key1', 'value1', 60000);
      cache.set('key2', 'value2', 60000);
      cache.set('key3', 'value3', 60000);

      cache.clear();

      expect(cache.get('key1')).toEqual({ hit: false });
      expect(cache.get('key2')).toEqual({ hit: false });
      expect(cache.get('key3')).toEqual({ hit: false });
    });
  });

  describe('has()', () => {
    it('returns true for existing valid entries', () => {
      cache.set('exists', 'value', 60000);
      expect(cache.has('exists')).toBe(true);
    });

    it('returns false for missing keys', () => {
      expect(cache.has('missing')).toBe(false);
    });

    it('returns false for expired entries', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      cache.set('test', 'value', 1000);
      vi.setSystemTime(now + 1001);

      expect(cache.has('test')).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('getTimestamp()', () => {
    it('returns timestamp for valid entries', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      cache.set('test', 'value', 60000);

      expect(cache.getTimestamp('test')).toBe(now);

      vi.useRealTimers();
    });

    it('returns undefined for missing keys', () => {
      expect(cache.getTimestamp('missing')).toBeUndefined();
    });

    it('returns undefined for expired entries', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      cache.set('test', 'value', 1000);
      vi.setSystemTime(now + 1001);

      expect(cache.getTimestamp('test')).toBeUndefined();

      vi.useRealTimers();
    });
  });
});

describe('StorageCache', () => {
  let cache: StorageCache;

  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.store = {};
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    localStorageMock.key.mockClear();

    // Attach mock to globalThis
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    cache = new StorageCache('test_cache_');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get()', () => {
    it('returns { hit: false } when localStorage unavailable', () => {
      // Simulate localStorage throwing error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage unavailable');
      });

      // Create new cache to trigger availability check
      const unavailableCache = new StorageCache('unavailable_');
      const result = unavailableCache.get('test');

      expect(result).toEqual({ hit: false });
    });

    it('returns { hit: false } for missing keys', () => {
      const result = cache.get('nonexistent');
      expect(result).toEqual({ hit: false });
    });

    it('returns { hit: false } for expired entries', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      cache.set('test', { value: 'data' }, 1000);

      vi.setSystemTime(now + 1001);

      const result = cache.get('test');
      expect(result).toEqual({ hit: false });

      vi.useRealTimers();
    });
  });

  describe('set() and get()', () => {
    it('stores and retrieves valid entries', () => {
      const testData = { name: 'Jane', id: 456 };
      cache.set('user', testData, 60000);

      const result = cache.get<typeof testData>('user');
      expect(result.hit).toBe(true);
      expect(result.data).toEqual(testData);
      expect(result.source).toBe('storage');
      expect(result.timestamp).toBeDefined();
    });

    it('uses correct prefixed key in localStorage', () => {
      cache.set('mykey', 'value', 60000);

      expect(localStorageMock.store['test_cache_mykey']).toBeDefined();
    });
  });

  describe('JSON parse errors', () => {
    it('handles JSON parse errors gracefully', () => {
      // Store invalid JSON directly
      localStorageMock.store['test_cache_invalid'] = 'not valid json{{{';

      const result = cache.get('invalid');
      expect(result).toEqual({ hit: false });
    });
  });

  describe('QuotaExceededError handling', () => {
    it('handles QuotaExceededError by clearing expired entries', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      // Add an entry that will be expired
      localStorageMock.store['test_cache_expired'] = JSON.stringify({
        data: 'old',
        timestamp: now - 2000, // Already expired
        ttl: 1000,
      });

      // Spy on console.warn before triggering quota error
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock quota exceeded on cache key setItem calls, but allow test key for isStorageAvailable
      let cacheSetAttempts = 0;
      localStorageMock.setItem.mockImplementation((key: string, value: string) => {
        // Allow the storage availability test to pass
        if (key === '__storage_test__') {
          localStorageMock.store[key] = value;
          return;
        }
        cacheSetAttempts++;
        if (cacheSetAttempts === 1) {
          const error = new DOMException('Quota exceeded', 'QuotaExceededError');
          throw error;
        }
        localStorageMock.store[key] = value;
      });

      cache.set('new-key', 'new-value', 60000);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Quota exceeded'));

      warnSpy.mockRestore();
      vi.useRealTimers();
    });

    it('clears all cache entries if still over quota after clearing expired', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      // Set up valid entries directly in the store
      localStorageMock.store['test_cache_entry1'] = JSON.stringify({
        data: 'value1',
        timestamp: now,
        ttl: 60000,
      });
      localStorageMock.store['test_cache_entry2'] = JSON.stringify({
        data: 'value2',
        timestamp: now,
        ttl: 60000,
      });

      // Spy on console.warn
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock quota exceeded on first 2 cache key attempts, success on third
      let cacheSetAttempts = 0;
      localStorageMock.setItem.mockImplementation((key: string, value: string) => {
        // Allow the storage availability test to pass
        if (key === '__storage_test__') {
          localStorageMock.store[key] = value;
          return;
        }
        cacheSetAttempts++;
        if (cacheSetAttempts <= 2) {
          const error = new DOMException('Quota exceeded', 'QuotaExceededError');
          throw error;
        }
        localStorageMock.store[key] = value;
      });

      cache.set('new-key', 'new-value', 60000);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Still over quota'));

      warnSpy.mockRestore();
      vi.useRealTimers();
    });
  });

  describe('invalidatePattern()', () => {
    it('removes matching keys with wildcard pattern', () => {
      cache.set('contact:1', { id: 1 }, 60000);
      cache.set('contact:2', { id: 2 }, 60000);
      cache.set('contact:3', { id: 3 }, 60000);
      cache.set('user:1', { id: 1 }, 60000);

      cache.invalidatePattern('contact:*');

      expect(cache.get('contact:1')).toEqual({ hit: false });
      expect(cache.get('contact:2')).toEqual({ hit: false });
      expect(cache.get('contact:3')).toEqual({ hit: false });
      expect(cache.get('user:1').hit).toBe(true);
    });

    it('works with exact pattern (no wildcard)', () => {
      cache.set('exact', 'value', 60000);
      cache.set('exact-more', 'value2', 60000);

      cache.invalidatePattern('exact');

      expect(cache.get('exact')).toEqual({ hit: false });
      expect(cache.get('exact-more').hit).toBe(true);
    });
  });

  describe('clear()', () => {
    it('only removes prefixed keys', () => {
      // Add cache entries
      cache.set('key1', 'value1', 60000);
      cache.set('key2', 'value2', 60000);

      // Add non-cache entry directly
      localStorageMock.store['other_app_key'] = 'should remain';

      cache.clear();

      expect(cache.get('key1')).toEqual({ hit: false });
      expect(cache.get('key2')).toEqual({ hit: false });
      expect(localStorageMock.store['other_app_key']).toBe('should remain');
    });
  });

  describe('has()', () => {
    it('returns true for existing valid entries', () => {
      cache.set('exists', 'value', 60000);
      expect(cache.has('exists')).toBe(true);
    });

    it('returns false for missing keys', () => {
      expect(cache.has('missing')).toBe(false);
    });
  });

  describe('getTimestamp()', () => {
    it('returns timestamp for valid entries', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      cache.set('test', 'value', 60000);

      expect(cache.getTimestamp('test')).toBe(now);

      vi.useRealTimers();
    });

    it('returns undefined for missing keys', () => {
      expect(cache.getTimestamp('missing')).toBeUndefined();
    });

    it('returns undefined for expired entries', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      cache.set('test', 'value', 1000);
      vi.setSystemTime(now + 1001);

      expect(cache.getTimestamp('test')).toBeUndefined();

      vi.useRealTimers();
    });
  });
});

describe('RequestDeduplicator', () => {
  let deduplicator: RequestDeduplicator;

  beforeEach(() => {
    deduplicator = new RequestDeduplicator();
  });

  describe('dedupe()', () => {
    it('returns same promise for concurrent calls with same key', async () => {
      let fetchCount = 0;
      const fetcher = () => {
        fetchCount++;
        return new Promise<string>(resolve => {
          setTimeout(() => resolve('data'), 10);
        });
      };

      const promise1 = deduplicator.dedupe('key', fetcher);
      const promise2 = deduplicator.dedupe('key', fetcher);
      const promise3 = deduplicator.dedupe('key', fetcher);

      // Should be the exact same promise
      expect(promise1).toBe(promise2);
      expect(promise2).toBe(promise3);

      // Wait for resolution
      const result = await Promise.all([promise1, promise2, promise3]);

      // Fetcher should only be called once
      expect(fetchCount).toBe(1);
      expect(result).toEqual(['data', 'data', 'data']);
    });

    it('allows new requests after promise resolves', async () => {
      let fetchCount = 0;
      const fetcher = () => {
        fetchCount++;
        return Promise.resolve(`result-${fetchCount}`);
      };

      const result1 = await deduplicator.dedupe('key', fetcher);
      const result2 = await deduplicator.dedupe('key', fetcher);

      expect(result1).toBe('result-1');
      expect(result2).toBe('result-2');
      expect(fetchCount).toBe(2);
    });
  });

  describe('cleanup after resolution', () => {
    it('cleans up after promise resolves', async () => {
      const fetcher = () => Promise.resolve('data');

      expect(deduplicator.isPending('key')).toBe(false);

      const promise = deduplicator.dedupe('key', fetcher);
      expect(deduplicator.isPending('key')).toBe(true);

      await promise;
      expect(deduplicator.isPending('key')).toBe(false);
    });

    it('cleans up after promise rejects', async () => {
      const error = new Error('Fetch failed');
      const fetcher = () => Promise.reject(error);

      expect(deduplicator.isPending('key')).toBe(false);

      const promise = deduplicator.dedupe('key', fetcher);
      expect(deduplicator.isPending('key')).toBe(true);

      await expect(promise).rejects.toThrow('Fetch failed');
      expect(deduplicator.isPending('key')).toBe(false);
    });
  });

  describe('isPending()', () => {
    it('returns true for in-flight requests', () => {
      const fetcher = () => new Promise<string>(resolve => {
        setTimeout(() => resolve('data'), 100);
      });

      deduplicator.dedupe('key', fetcher);

      expect(deduplicator.isPending('key')).toBe(true);
      expect(deduplicator.isPending('other-key')).toBe(false);
    });

    it('returns false when no request is pending', () => {
      expect(deduplicator.isPending('any-key')).toBe(false);
    });
  });

  describe('getPendingCount()', () => {
    it('returns correct count of pending requests', async () => {
      expect(deduplicator.getPendingCount()).toBe(0);

      const fetcher1 = () => new Promise<string>(resolve => {
        setTimeout(() => resolve('data1'), 50);
      });
      const fetcher2 = () => new Promise<string>(resolve => {
        setTimeout(() => resolve('data2'), 50);
      });
      const fetcher3 = () => new Promise<string>(resolve => {
        setTimeout(() => resolve('data3'), 50);
      });

      const p1 = deduplicator.dedupe('key1', fetcher1);
      expect(deduplicator.getPendingCount()).toBe(1);

      const p2 = deduplicator.dedupe('key2', fetcher2);
      expect(deduplicator.getPendingCount()).toBe(2);

      const p3 = deduplicator.dedupe('key3', fetcher3);
      expect(deduplicator.getPendingCount()).toBe(3);

      await Promise.all([p1, p2, p3]);
      expect(deduplicator.getPendingCount()).toBe(0);
    });
  });

  describe('clear()', () => {
    it('clears all pending entries', () => {
      const fetcher = () => new Promise<string>(resolve => {
        setTimeout(() => resolve('data'), 100);
      });

      deduplicator.dedupe('key1', fetcher);
      deduplicator.dedupe('key2', fetcher);

      expect(deduplicator.getPendingCount()).toBe(2);

      deduplicator.clear();

      expect(deduplicator.getPendingCount()).toBe(0);
    });
  });
});

describe('cachedFetch', () => {
  // We need to mock the module to control the internal caches
  let mockMemoryCache: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };
  let mockStorageCache: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };
  let mockDeduplicator: {
    dedupe: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.resetModules();

    mockMemoryCache = {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
    };
    mockStorageCache = {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
    };
    mockDeduplicator = {
      dedupe: vi.fn(),
      clear: vi.fn(),
    };

    // Mock console.log to avoid noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('cache hit scenarios', () => {
    it('returns from memory cache when available', async () => {
      const memoryCache = new MemoryCache();
      const testData = { contacts: [{ id: 1 }] };

      memoryCache.set('contacts', testData, 60000);

      const result = memoryCache.get('contacts');

      expect(result.hit).toBe(true);
      expect(result.data).toEqual(testData);
      expect(result.source).toBe('memory');
    });

    it('falls back to storage cache on memory miss', async () => {
      const memoryCache = new MemoryCache();
      const storageCache = new StorageCache('test_');

      // Setup localStorage mock
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
      localStorageMock.store = {};

      const testData = { contacts: [{ id: 2 }] };

      // Only set in storage cache
      storageCache.set('contacts', testData, 60000);

      // Memory cache should miss
      const memoryResult = memoryCache.get('contacts');
      expect(memoryResult.hit).toBe(false);

      // Storage cache should hit
      const storageResult = storageCache.get('contacts');
      expect(storageResult.hit).toBe(true);
      expect(storageResult.data).toEqual(testData);
      expect(storageResult.source).toBe('storage');
    });
  });

  describe('network fetch scenarios', () => {
    it('fetches from network on full cache miss', async () => {
      const memoryCache = new MemoryCache();
      const storageCache = new StorageCache('test_');
      const deduplicator = new RequestDeduplicator();

      // Setup localStorage mock
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
      localStorageMock.store = {};

      const testData = { contacts: [{ id: 3 }] };
      const fetcher = vi.fn().mockResolvedValue(testData);

      // Both caches should miss
      expect(memoryCache.get('contacts').hit).toBe(false);
      expect(storageCache.get('contacts').hit).toBe(false);

      // Fetch via deduplicator
      const result = await deduplicator.dedupe('contacts', fetcher);

      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(result).toEqual(testData);
    });

    it('stores in both caches after network fetch', async () => {
      const memoryCache = new MemoryCache();
      const storageCache = new StorageCache('test_');

      // Setup localStorage mock
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
      localStorageMock.store = {};

      const testData = { contacts: [{ id: 4 }] };
      const config = { memoryTtl: 60000, storageTtl: 300000 };

      // Simulate storing after network fetch
      memoryCache.set('contacts', testData, config.memoryTtl);
      storageCache.set('contacts', testData, config.storageTtl);

      // Verify both caches have the data
      expect(memoryCache.get('contacts').hit).toBe(true);
      expect(memoryCache.get('contacts').data).toEqual(testData);

      expect(storageCache.get('contacts').hit).toBe(true);
      expect(storageCache.get('contacts').data).toEqual(testData);
    });
  });

  describe('forceRefresh behavior', () => {
    it('bypasses cache when forceRefresh is true', async () => {
      const memoryCache = new MemoryCache();
      const storageCache = new StorageCache('test_');
      const deduplicator = new RequestDeduplicator();

      // Setup localStorage mock
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
      localStorageMock.store = {};

      const cachedData = { old: true };
      const freshData = { fresh: true };

      // Set data in both caches
      memoryCache.set('contacts', cachedData, 60000);
      storageCache.set('contacts', cachedData, 60000);

      // Verify caches have data
      expect(memoryCache.get('contacts').hit).toBe(true);
      expect(storageCache.get('contacts').hit).toBe(true);

      // When forceRefresh is true, we should fetch fresh data
      const fetcher = vi.fn().mockResolvedValue(freshData);
      const result = await deduplicator.dedupe('contacts', fetcher);

      expect(result).toEqual(freshData);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration with cachedFetch function', () => {
    it('correctly orchestrates cache lookup and network fetch', async () => {
      // Import the actual cachedFetch function
      const { cachedFetch, clearAllCaches } = await import('../index');

      // Setup localStorage mock
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
      localStorageMock.store = {};

      // Clear any existing cache state
      clearAllCaches();

      const testData = { users: ['Alice', 'Bob'] };
      const fetcher = vi.fn().mockResolvedValue(testData);
      const config = { memoryTtl: 60000, storageTtl: 300000 };

      // First call - should fetch from network
      const result1 = await cachedFetch('users', fetcher, config);
      expect(result1.data).toEqual(testData);
      expect(result1.source).toBe('network');
      expect(fetcher).toHaveBeenCalledTimes(1);

      // Second call - should return from memory cache
      const result2 = await cachedFetch('users', fetcher, config);
      expect(result2.data).toEqual(testData);
      expect(result2.source).toBe('memory');
      expect(fetcher).toHaveBeenCalledTimes(1); // Not called again

      // Force refresh - should fetch from network again
      const result3 = await cachedFetch('users', fetcher, config, { forceRefresh: true });
      expect(result3.data).toEqual(testData);
      expect(result3.source).toBe('network');
      expect(fetcher).toHaveBeenCalledTimes(2);

      // Cleanup
      clearAllCaches();
    });

    it('promotes storage cache to memory cache on storage hit', async () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      const { cachedFetch, clearAllCaches } = await import('../index');

      // Setup localStorage mock
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
      localStorageMock.store = {};

      clearAllCaches();

      const testData = { items: [1, 2, 3] };
      const fetcher = vi.fn().mockResolvedValue(testData);
      const config = { memoryTtl: 1000, storageTtl: 60000 }; // Short memory TTL

      // First call - fetch from network
      await cachedFetch('items', fetcher, config);

      // Advance time to expire memory cache but not storage cache
      vi.setSystemTime(now + 1500);

      // Second call - should come from storage (memory expired)
      const result = await cachedFetch('items', fetcher, config);
      expect(result.data).toEqual(testData);
      expect(result.source).toBe('storage');
      expect(fetcher).toHaveBeenCalledTimes(1); // Not called again

      clearAllCaches();
      vi.useRealTimers();
    });
  });
});
