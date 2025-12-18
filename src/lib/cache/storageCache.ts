import type { CacheEntry, CacheLookupResult } from './types';

/**
 * StorageCache provides a localStorage-based cache with TTL support.
 * This serves as Tier 2 in the hybrid caching strategy, offering
 * persistence across page refreshes with configurable expiration.
 */
export class StorageCache {
  private readonly prefix: string;
  private storageAvailable: boolean | null = null;

  /**
   * Creates a new StorageCache instance.
   * @param prefix - Key prefix for all cache entries (default: 'crm_cache_')
   */
  constructor(prefix: string = 'crm_cache_') {
    this.prefix = prefix;
  }

  /**
   * Checks if localStorage is available and functional.
   * Result is cached after first check for performance.
   * @returns true if localStorage can be used
   */
  private isStorageAvailable(): boolean {
    if (this.storageAvailable !== null) {
      return this.storageAvailable;
    }
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      this.storageAvailable = true;
    } catch {
      this.storageAvailable = false;
    }
    return this.storageAvailable;
  }

  /**
   * Gets the full storage key with prefix.
   * @param key - The cache key
   * @returns The prefixed key
   */
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Checks if a cache entry is expired.
   * @param entry - The cache entry to check
   * @returns true if the entry is expired
   */
  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() > entry.timestamp + entry.ttl;
  }

  /**
   * Retrieves a value from the cache.
   * @param key - The cache key
   * @returns Cache lookup result with hit status and data if found
   */
  get<T>(key: string): CacheLookupResult<T> {
    if (!this.isStorageAvailable()) {
      return { hit: false };
    }

    const fullKey = this.getFullKey(key);

    try {
      const raw = localStorage.getItem(fullKey);
      if (raw === null) {
        return { hit: false };
      }

      const entry = JSON.parse(raw) as CacheEntry<T>;

      if (this.isExpired(entry)) {
        // Clean up expired entry
        localStorage.removeItem(fullKey);
        return { hit: false };
      }

      return {
        hit: true,
        data: entry.data,
        source: 'storage',
        timestamp: entry.timestamp,
      };
    } catch {
      // JSON parse error or other issue - treat as cache miss
      return { hit: false };
    }
  }

  /**
   * Stores a value in the cache with TTL.
   * @param key - The cache key
   * @param data - The data to cache
   * @param ttl - Time-to-live in milliseconds
   */
  set<T>(key: string, data: T, ttl: number): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    const fullKey = this.getFullKey(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    try {
      localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        this.handleQuotaExceeded(fullKey, entry);
      }
    }
  }

  /**
   * Checks if an error is a QuotaExceededError.
   * @param error - The error to check
   * @returns true if it's a quota exceeded error
   */
  private isQuotaExceededError(error: unknown): boolean {
    return (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    );
  }

  /**
   * Handles QuotaExceededError by clearing expired entries first,
   * then all cache entries if needed.
   * @param key - The key that failed to save
   * @param entry - The entry that failed to save
   */
  private handleQuotaExceeded<T>(key: string, entry: CacheEntry<T>): void {
    console.warn('[StorageCache] Quota exceeded, clearing expired entries');

    // First, try clearing only expired entries
    this.clearExpired();

    try {
      localStorage.setItem(key, JSON.stringify(entry));
      return;
    } catch (error) {
      if (!this.isQuotaExceededError(error)) {
        return;
      }
    }

    // Still failing, clear all our cache entries
    console.warn('[StorageCache] Still over quota, clearing all cache entries');
    this.clear();

    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch {
      console.warn('[StorageCache] Unable to save entry after clearing cache');
    }
  }

  /**
   * Clears all expired entries from our cache.
   */
  private clearExpired(): void {
    const keys = this.getAllCacheKeys();
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          const entry = JSON.parse(raw) as CacheEntry<unknown>;
          if (this.isExpired(entry)) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // If we can't parse it, remove it
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Gets all localStorage keys that belong to our cache.
   * @returns Array of full keys (with prefix)
   */
  private getAllCacheKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null && key.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Removes a specific entry from the cache.
   * @param key - The cache key to invalidate
   */
  invalidate(key: string): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    const fullKey = this.getFullKey(key);
    localStorage.removeItem(fullKey);
  }

  /**
   * Removes all entries matching a pattern.
   * Supports wildcard (*) matching.
   * @param pattern - Pattern to match (e.g., "contact:*")
   */
  invalidatePattern(pattern: string): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    const fullPattern = this.getFullKey(pattern);
    const regex = this.patternToRegex(fullPattern);
    const keys = this.getAllCacheKeys();

    for (const key of keys) {
      if (regex.test(key)) {
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Converts a wildcard pattern to a RegExp.
   * @param pattern - Pattern with * wildcards
   * @returns RegExp for matching
   */
  private patternToRegex(pattern: string): RegExp {
    // Escape special regex characters except *
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    // Convert * to .*
    const regexStr = escaped.replace(/\*/g, '.*');
    return new RegExp(`^${regexStr}$`);
  }

  /**
   * Clears all entries from our cache (entries with our prefix).
   */
  clear(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    const keys = this.getAllCacheKeys();
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Checks if a valid (non-expired) entry exists for a key.
   * @param key - The cache key
   * @returns true if a valid entry exists
   */
  has(key: string): boolean {
    const result = this.get(key);
    return result.hit;
  }

  /**
   * Gets the timestamp when an entry was cached.
   * @param key - The cache key
   * @returns Timestamp in ms since epoch, or undefined if not found
   */
  getTimestamp(key: string): number | undefined {
    if (!this.isStorageAvailable()) {
      return undefined;
    }

    const fullKey = this.getFullKey(key);

    try {
      const raw = localStorage.getItem(fullKey);
      if (raw === null) {
        return undefined;
      }

      const entry = JSON.parse(raw) as CacheEntry<unknown>;

      // Only return timestamp if entry is not expired
      if (this.isExpired(entry)) {
        return undefined;
      }

      return entry.timestamp;
    } catch {
      return undefined;
    }
  }
}

export default StorageCache;
