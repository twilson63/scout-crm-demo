/**
 * Unified Cache API
 * 
 * Provides a single entry point for the hybrid caching strategy:
 * 1. Request Deduplication - Prevents duplicate in-flight calls
 * 2. Memory Cache (Tier 1) - TTL 1-2 minutes, instant access
 * 3. localStorage Cache (Tier 2) - TTL 10-15 minutes, survives refresh
 */

import { MemoryCache } from './memoryCache';
import { StorageCache } from './storageCache';
import { RequestDeduplicator } from './deduplication';
import type { CacheConfig, CachedFetchOptions } from './types';
import { DEFAULT_TTL, CACHE_KEYS } from './types';

// Only log in development mode
const DEBUG = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

// Export types and constants
export { DEFAULT_TTL, CACHE_KEYS };
export type { CacheConfig, CachedFetchOptions, CacheLookupResult, CacheEntry } from './types';

// Export individual cache classes for direct use if needed
export { MemoryCache } from './memoryCache';
export { StorageCache } from './storageCache';
export { RequestDeduplicator, requestDeduplicator } from './deduplication';

// Singleton instances for the application
const memoryCache = new MemoryCache();
const storageCache = new StorageCache();
const deduplicator = new RequestDeduplicator();

/**
 * Last fetch timestamps for "last updated" UI display
 * Key -> timestamp (ms since epoch)
 */
const lastFetchTimestamps = new Map<string, number>();

/**
 * Get the timestamp of when data was last fetched from the network
 * @param key - Cache key
 * @returns Timestamp in ms, or undefined if never fetched
 */
export function getLastFetchTimestamp(key: string): number | undefined {
  return lastFetchTimestamps.get(key);
}

/**
 * Clears all caches (memory, storage, and timestamps)
 * Useful for logout or testing
 */
export function clearAllCaches(): void {
  memoryCache.clear();
  storageCache.clear();
  deduplicator.clear();
  lastFetchTimestamps.clear();
  if (DEBUG) console.log('[Cache] All caches cleared');
}

/**
 * Invalidates a specific cache key from all cache tiers
 * @param key - Cache key to invalidate
 */
export function invalidateCache(key: string): void {
  memoryCache.invalidate(key);
  storageCache.invalidate(key);
  lastFetchTimestamps.delete(key);
  if (DEBUG) console.log(`[Cache] Invalidated: ${key}`);
}

/**
 * Invalidates cache keys matching a pattern (supports wildcards)
 * @param pattern - Pattern to match (e.g., "contact:*")
 */
export function invalidateCachePattern(pattern: string): void {
  memoryCache.invalidatePattern(pattern);
  storageCache.invalidatePattern(pattern);
  // Clear matching timestamps
  if (pattern === '*') {
    lastFetchTimestamps.clear();
  } else {
    const prefix = pattern.replace(/\*+$/, '');
    for (const key of lastFetchTimestamps.keys()) {
      if (key.startsWith(prefix)) {
        lastFetchTimestamps.delete(key);
      }
    }
  }
  if (DEBUG) console.log(`[Cache] Invalidated pattern: ${pattern}`);
}

/**
 * Fetches data with the hybrid caching strategy.
 * 
 * Flow:
 * 1. Check for in-flight request (deduplication)
 * 2. Check memory cache (instant)
 * 3. Check localStorage cache (fast)
 * 4. Fetch from network (slow, 30+ seconds)
 * 
 * @param key - Cache key for this data
 * @param fetcher - Async function that fetches the data
 * @param config - Cache TTL configuration
 * @param options - Additional options (forceRefresh, etc.)
 * @returns The cached or fetched data
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig,
  options: CachedFetchOptions = {}
): Promise<{ data: T; source: 'memory' | 'storage' | 'network'; timestamp: number }> {
  const { forceRefresh = false } = options;

  // If not forcing refresh, check caches first
  if (!forceRefresh) {
    // Check memory cache (Tier 1)
    const memoryResult = memoryCache.get<T>(key);
    if (memoryResult.hit && memoryResult.data !== undefined) {
      if (DEBUG) console.log(`[Cache] Memory hit: ${key}`);
      return {
        data: memoryResult.data,
        source: 'memory',
        timestamp: memoryResult.timestamp!,
      };
    }

    // Check localStorage cache (Tier 2)
    const storageResult = storageCache.get<T>(key);
    if (storageResult.hit && storageResult.data !== undefined) {
      if (DEBUG) console.log(`[Cache] Storage hit: ${key}`);
      // Promote to memory cache for faster subsequent access
      memoryCache.set(key, storageResult.data, config.memoryTtl);
      return {
        data: storageResult.data,
        source: 'storage',
        timestamp: storageResult.timestamp!,
      };
    }
  } else {
    if (DEBUG) console.log(`[Cache] Force refresh: ${key}`);
  }

  // Cache miss - fetch from network with deduplication
  if (DEBUG) console.log(`[Cache] Network fetch: ${key}`);
  
  const data = await deduplicator.dedupe(key, fetcher);
  const timestamp = Date.now();

  // Store in both caches
  memoryCache.set(key, data, config.memoryTtl);
  storageCache.set(key, data, config.storageTtl);
  lastFetchTimestamps.set(key, timestamp);

  return {
    data,
    source: 'network',
    timestamp,
  };
}

/**
 * Gets cache status for a key (for debugging/UI)
 */
export function getCacheStatus(key: string): {
  inMemory: boolean;
  inStorage: boolean;
  isPending: boolean;
  lastFetch?: number;
} {
  return {
    inMemory: memoryCache.has(key),
    inStorage: storageCache.has(key),
    isPending: deduplicator.isPending(key),
    lastFetch: lastFetchTimestamps.get(key),
  };
}
