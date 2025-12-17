/**
 * Authentication Store
 * 
 * Manages authentication state with localStorage persistence.
 */

import { writable } from 'svelte/store';
import type { AuthState } from '../types';

const AUTH_STORAGE_KEY = 'crm_auth';

/**
 * Load initial auth state from localStorage
 */
function loadAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return {
      username: '',
      apiKey: '',
      isAuthenticated: false
    };
  }

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AuthState;
      // Validate the stored data has required fields
      if (parsed.username && parsed.apiKey) {
        return {
          ...parsed,
          isAuthenticated: true
        };
      }
    }
  } catch (error) {
    console.error('Failed to load auth state from localStorage:', error);
  }

  return {
    username: '',
    apiKey: '',
    isAuthenticated: false
  };
}

/**
 * Create the auth store with localStorage persistence
 */
function createAuthStore() {
  const initialState = loadAuthState();
  const { subscribe, set, update } = writable<AuthState>(initialState);

  // Subscribe to persist changes to localStorage
  if (typeof window !== 'undefined') {
    subscribe((state) => {
      if (state.isAuthenticated) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          username: state.username,
          apiKey: state.apiKey,
          isAuthenticated: state.isAuthenticated
        }));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    });
  }

  return {
    subscribe,
    set,
    update
  };
}

/**
 * The authentication store
 */
export const auth = createAuthStore();

/**
 * Log in a user with username and API key
 */
export function login(username: string, apiKey: string): void {
  auth.set({
    username,
    apiKey,
    isAuthenticated: true
  });
}

/**
 * Log out the current user
 */
export function logout(): void {
  auth.set({
    username: '',
    apiKey: '',
    isAuthenticated: false
  });
}

/**
 * Get the current API key (for use in API calls)
 * Returns empty string if not authenticated
 */
export function getApiKey(): string {
  let apiKey = '';
  auth.subscribe((state) => {
    apiKey = state.apiKey;
  })();
  return apiKey;
}
