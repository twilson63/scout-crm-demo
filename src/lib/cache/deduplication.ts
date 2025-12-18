/**
 * Request deduplication module for preventing duplicate in-flight API calls.
 * When multiple components request the same data simultaneously,
 * this ensures only one network request is made and all callers
 * receive the same result.
 */

/**
 * Manages deduplication of in-flight requests.
 * Multiple callers requesting the same key will share a single Promise.
 */
export class RequestDeduplicator {
  private pending: Map<string, Promise<unknown>> = new Map();

  /**
   * Executes a fetch operation with deduplication.
   * If a request for the same key is already in-flight, returns the existing Promise.
   * Otherwise, executes the fetcher and stores the Promise until it settles.
   *
   * @param key - Unique identifier for this request (e.g., 'contacts', 'contact:123')
   * @param fetcher - Function that returns a Promise with the data
   * @returns Promise that resolves to the fetched data
   *
   * @example
   * // First call starts the fetch
   * const result1 = deduplicator.dedupe('contacts', () => fetchContacts());
   * // Second call (while first is in-flight) returns same promise
   * const result2 = deduplicator.dedupe('contacts', () => fetchContacts());
   * // result1 === result2 (same Promise instance)
   */
  dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check if there's already a pending request for this key
    const existingRequest = this.pending.get(key);
    if (existingRequest) {
      return existingRequest as Promise<T>;
    }

    // Execute the fetcher and store the promise
    const request = fetcher()
      .then((result) => {
        // Clean up on success
        this.pending.delete(key);
        return result;
      })
      .catch((error) => {
        // Clean up on failure
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, request);
    return request;
  }

  /**
   * Checks if a request is currently in-flight for the given key.
   *
   * @param key - The request key to check
   * @returns True if a request is pending for this key
   */
  isPending(key: string): boolean {
    return this.pending.has(key);
  }

  /**
   * Gets the count of currently in-flight requests.
   *
   * @returns Number of pending requests
   */
  getPendingCount(): number {
    return this.pending.size;
  }

  /**
   * Clears all pending request entries.
   * Useful for testing or resetting state.
   * Note: This does not cancel the actual requests, just removes tracking.
   */
  clear(): void {
    this.pending.clear();
  }
}

/**
 * Singleton instance for convenience.
 * Use this for application-wide request deduplication.
 */
export const requestDeduplicator = new RequestDeduplicator();

export default RequestDeduplicator;
