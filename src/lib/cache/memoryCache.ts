import type { CacheEntry, CacheLookupResult } from './types';

/**
 * In-memory cache implementation using Map storage.
 * Provides TTL-based expiration and pattern-based invalidation.
 */
export class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Retrieves a value from the cache.
   * Automatically removes expired entries.
   * @param key - The cache key to look up
   * @returns Cache lookup result with hit status and data
   */
  get<T>(key: string): CacheLookupResult<T> {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return { hit: false };
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return { hit: false };
    }

    return {
      hit: true,
      data: entry.data,
      source: 'memory',
      timestamp: entry.timestamp,
    };
  }

  /**
   * Stores a value in the cache with the specified TTL.
   * @param key - The cache key
   * @param data - The data to cache
   * @param ttl - Time-to-live in milliseconds
   */
  set<T>(key: string, data: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    this.cache.set(key, entry as CacheEntry<unknown>);
  }

  /**
   * Removes a specific key from the cache.
   * @param key - The cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Removes all keys matching a pattern.
   * Supports wildcard (*) at the end of the pattern.
   * @param pattern - Pattern to match (e.g., "contact:*")
   */
  invalidatePattern(pattern: string): void {
    if (!pattern.includes('*')) {
      this.cache.delete(pattern);
      return;
    }

    const prefix = pattern.replace(/\*+$/, '');
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Clears all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Checks if a valid (non-expired) entry exists for the key.
   * @param key - The cache key to check
   * @returns True if a valid entry exists
   */
  has(key: string): boolean {
    const result = this.get(key);
    return result.hit;
  }

  /**
   * Gets the timestamp when an entry was cached.
   * @param key - The cache key
   * @returns The timestamp in milliseconds, or undefined if not found
   */
  getTimestamp(key: string): number | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      return undefined;
    }

    return entry.timestamp;
  }
}

export default MemoryCache;
