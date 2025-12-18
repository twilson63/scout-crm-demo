/**
 * Cache types for the hybrid caching strategy
 * 
 * Architecture:
 * - Memory Cache (Tier 1): TTL 1-2 minutes, instant access
 * - localStorage Cache (Tier 2): TTL 10-15 minutes, survives refresh
 * - Request Deduplication: Prevents duplicate in-flight calls
 */

/**
 * Represents a cached entry with metadata
 */
export interface CacheEntry<T> {
  /** The cached data */
  data: T;
  /** Timestamp when the entry was created (ms since epoch) */
  timestamp: number;
  /** Time-to-live in milliseconds */
  ttl: number;
  /** Optional flag indicating this is an optimistic/pending entry */
  _pending?: boolean;
}

/**
 * Configuration for cache behavior
 */
export interface CacheConfig {
  /** TTL for memory cache in milliseconds */
  memoryTtl: number;
  /** TTL for localStorage cache in milliseconds */
  storageTtl: number;
  /** Cache key prefix for localStorage */
  keyPrefix?: string;
}

/**
 * Default TTL configurations by data type (in milliseconds)
 */
export const DEFAULT_TTL = {
  /** Contacts list: 2 min memory, 15 min storage */
  contacts: {
    memoryTtl: 2 * 60 * 1000,
    storageTtl: 15 * 60 * 1000,
  },
  /** Dashboard: 1 min memory, 10 min storage */
  dashboard: {
    memoryTtl: 1 * 60 * 1000,
    storageTtl: 10 * 60 * 1000,
  },
  /** Contact details: 1 min memory, 10 min storage */
  contactDetails: {
    memoryTtl: 1 * 60 * 1000,
    storageTtl: 10 * 60 * 1000,
  },
} as const;

/**
 * Cache key constants for consistent key usage
 */
export const CACHE_KEYS = {
  CONTACTS_LIST: 'contacts',
  DASHBOARD: 'dashboard',
  CONTACT_DETAIL: (id: string) => `contact:${id}`,
} as const;

/**
 * Result of a cache lookup
 */
export interface CacheLookupResult<T> {
  /** Whether the cache hit was successful */
  hit: boolean;
  /** The cached data (undefined if miss) */
  data?: T;
  /** Whether the data is stale but usable */
  stale?: boolean;
  /** Source of the data */
  source?: 'memory' | 'storage' | 'network';
  /** Timestamp when data was cached */
  timestamp?: number;
}

/**
 * Options for cachedFetch function
 */
export interface CachedFetchOptions {
  /** Force bypass cache and fetch from network */
  forceRefresh?: boolean;
  /** Use stale-while-revalidate pattern */
  staleWhileRevalidate?: boolean;
  /** Custom cache config override */
  config?: Partial<CacheConfig>;
}

/**
 * Interface for cache implementations
 */
export interface ICache {
  /** Get a value from cache */
  get<T>(key: string): CacheLookupResult<T>;
  /** Set a value in cache */
  set<T>(key: string, data: T, ttl: number): void;
  /** Invalidate a specific key */
  invalidate(key: string): void;
  /** Invalidate all keys matching a pattern */
  invalidatePattern(pattern: string): void;
  /** Clear all cached data */
  clear(): void;
}
