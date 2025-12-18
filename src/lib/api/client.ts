/**
 * Scout API Client
 * 
 * Handles all communication with the Scout CRM API.
 * Integrates with hybrid caching strategy for improved performance.
 */

import type {
  ApiResponse,
  Contact,
  ContactWithActivities,
  Activity,
  DashboardData,
  CreateContactData,
  LogActivityData
} from '../types';

import {
  listContactsCommand,
  getDashboardCommand,
  getContactDetailsCommand,
  createContactCommand,
  logActivityCommand
} from './commands';

import {
  cachedFetch,
  invalidateCache,
  invalidateCachePattern,
  getLastFetchTimestamp,
  DEFAULT_TTL,
  CACHE_KEYS,
} from '../cache';

const SCOUT_API_ENDPOINT = 'https://api-prod.scoutos.com/v2/workflows/wf_cmj94h2ij00010hs6hqatcw6x/execute';

/**
 * Parse the Scout API response to extract JSON data
 * The API returns JSON embedded in the run.state.agent_message.output field
 */
function parseScoutResponse<T>(response: unknown): T | null {
  try {
    if (typeof response === 'object' && response !== null) {
      const resp = response as Record<string, unknown>;
      
      // Navigate to the output field in the Scout API response
      // Structure: { run: { state: { agent_message: { output: "..." } } } }
      let output: string | null = null;
      
      if (resp.run && typeof resp.run === 'object') {
        const run = resp.run as Record<string, unknown>;
        if (run.state && typeof run.state === 'object') {
          const state = run.state as Record<string, unknown>;
          if (state.agent_message && typeof state.agent_message === 'object') {
            const agentMessage = state.agent_message as Record<string, unknown>;
            if (typeof agentMessage.output === 'string') {
              output = agentMessage.output;
            }
          }
        }
      }
      
      // Fallback: try other common response patterns
      if (!output) {
        if ('content' in resp && typeof resp.content === 'string') {
          output = resp.content;
        } else if ('message' in resp && typeof resp.message === 'string') {
          output = resp.message;
        } else if ('output' in resp && typeof resp.output === 'string') {
          output = resp.output;
        }
      }
      
      if (output) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1]) as T;
        }
        // Try direct JSON parse
        try {
          return JSON.parse(output) as T;
        } catch {
          // Content might not be JSON, return null
          return null;
        }
      }
      
      // If response itself looks like the data we want, return it
      if ('contacts' in resp || 'id' in resp || 'contactCounts' in resp) {
        return resp as T;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to parse Scout response:', error);
    return null;
  }
}

/**
 * Execute a command against the Scout API
 */
export async function executeCommand<T>(
  apiKey: string,
  message: string
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(SCOUT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ 
        inputs: { message },
        stream: false 
      })
    });

    if (!response.ok) {
      // Try to get more details from the error response
      let errorDetail = '';
      try {
        const errorBody = await response.json();
        errorDetail = JSON.stringify(errorBody);
        console.error('API Error Response:', errorBody);
      } catch {
        // Response might not be JSON
        try {
          errorDetail = await response.text();
        } catch {
          errorDetail = 'Could not read error response';
        }
      }
      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}. ${errorDetail}`
      };
    }

    const rawResponse = await response.json();
    
    // Check for API-level errors
    if (rawResponse.run?.stop_reason === 'workflow_run_failed') {
      const errors = rawResponse.run?.errors || ['Unknown error'];
      return {
        success: false,
        error: errors.join(', '),
        rawResponse
      };
    }
    
    const data = parseScoutResponse<T>(rawResponse);

    if (data === null) {
      return {
        success: false,
        error: 'Failed to parse API response',
        rawResponse
      };
    }

    return {
      success: true,
      data,
      rawResponse
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Internal function to fetch contacts from API (no caching)
 */
async function fetchContactsFromApi(apiKey: string): Promise<ApiResponse<Contact[]>> {
  const command = listContactsCommand();
  const response = await executeCommand<{ contacts: Contact[] } | Contact[]>(apiKey, command);
  
  if (!response.success || !response.data) {
    return response as ApiResponse<Contact[]>;
  }
  
  // Handle both array and wrapped object responses
  const contacts = Array.isArray(response.data) 
    ? response.data 
    : response.data.contacts || [];
  
  // Map document_id to id if needed
  const normalizedContacts = contacts.map(c => ({
    ...c,
    id: c.id || (c as any).document_id
  }));
  
  return {
    success: true,
    data: normalizedContacts,
    rawResponse: response.rawResponse
  };
}

/** Options for cached API calls */
export interface CachedApiOptions {
  /** Force bypass cache and fetch fresh data */
  forceRefresh?: boolean;
}

/**
 * List all contacts (cached)
 * Uses hybrid caching: memory (2 min) + localStorage (15 min)
 */
export async function listContacts(
  apiKey: string,
  options: CachedApiOptions = {}
): Promise<ApiResponse<Contact[]>> {
  try {
    const result = await cachedFetch<ApiResponse<Contact[]>>(
      CACHE_KEYS.CONTACTS_LIST,
      () => fetchContactsFromApi(apiKey),
      DEFAULT_TTL.contacts,
      options
    );
    return result.data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get the timestamp of when contacts were last fetched
 */
export function getContactsLastFetchTime(): number | undefined {
  return getLastFetchTimestamp(CACHE_KEYS.CONTACTS_LIST);
}

/**
 * Internal function to fetch dashboard from API (no caching)
 */
async function fetchDashboardFromApi(apiKey: string): Promise<ApiResponse<DashboardData>> {
  const command = getDashboardCommand();
  return executeCommand<DashboardData>(apiKey, command);
}

/**
 * Get dashboard data (cached)
 * Uses hybrid caching: memory (1 min) + localStorage (10 min)
 */
export async function getDashboard(
  apiKey: string,
  options: CachedApiOptions = {}
): Promise<ApiResponse<DashboardData>> {
  try {
    const result = await cachedFetch<ApiResponse<DashboardData>>(
      CACHE_KEYS.DASHBOARD,
      () => fetchDashboardFromApi(apiKey),
      DEFAULT_TTL.dashboard,
      options
    );
    return result.data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get the timestamp of when dashboard was last fetched
 */
export function getDashboardLastFetchTime(): number | undefined {
  return getLastFetchTimestamp(CACHE_KEYS.DASHBOARD);
}

/**
 * Internal function to fetch contact details from API (no caching)
 */
async function fetchContactDetailsFromApi(
  apiKey: string,
  contactId: string
): Promise<ApiResponse<ContactWithActivities>> {
  const command = getContactDetailsCommand(contactId);
  return executeCommand<ContactWithActivities>(apiKey, command);
}

/**
 * Get contact details with activities (cached)
 * Uses hybrid caching: memory (1 min) + localStorage (10 min)
 */
export async function getContactDetails(
  apiKey: string,
  contactId: string,
  options: CachedApiOptions = {}
): Promise<ApiResponse<ContactWithActivities>> {
  try {
    const cacheKey = CACHE_KEYS.CONTACT_DETAIL(contactId);
    const result = await cachedFetch<ApiResponse<ContactWithActivities>>(
      cacheKey,
      () => fetchContactDetailsFromApi(apiKey, contactId),
      DEFAULT_TTL.contactDetails,
      options
    );
    return result.data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get the timestamp of when contact details were last fetched
 */
export function getContactDetailsLastFetchTime(contactId: string): number | undefined {
  return getLastFetchTimestamp(CACHE_KEYS.CONTACT_DETAIL(contactId));
}

/**
 * Create a new contact
 * Invalidates contacts list and dashboard caches on success
 */
export async function createContact(
  apiKey: string,
  data: CreateContactData
): Promise<ApiResponse<Contact>> {
  const command = createContactCommand(data);
  const response = await executeCommand<Contact>(apiKey, command);
  
  if (response.success) {
    // Invalidate related caches
    invalidateCache(CACHE_KEYS.CONTACTS_LIST);
    invalidateCache(CACHE_KEYS.DASHBOARD);
  }
  
  return response;
}

/**
 * Log an activity for a contact
 * Invalidates contact details and dashboard caches on success
 */
export async function logActivity(
  apiKey: string,
  data: LogActivityData
): Promise<ApiResponse<Activity>> {
  const command = logActivityCommand(data);
  const response = await executeCommand<Activity>(apiKey, command);
  
  if (response.success) {
    // Invalidate related caches
    invalidateCache(CACHE_KEYS.CONTACT_DETAIL(data.contactId));
    invalidateCache(CACHE_KEYS.DASHBOARD);
  }
  
  return response;
}

/**
 * Force refresh all cached data
 * Useful for manual refresh button
 */
export async function refreshAllData(apiKey: string): Promise<void> {
  // Invalidate all caches
  invalidateCachePattern('*');
  
  // Pre-fetch the main data
  await Promise.all([
    listContacts(apiKey, { forceRefresh: true }),
    getDashboard(apiKey, { forceRefresh: true }),
  ]);
}

// Re-export cache utilities for components
export { invalidateCache, invalidateCachePattern, clearAllCaches } from '../cache';
