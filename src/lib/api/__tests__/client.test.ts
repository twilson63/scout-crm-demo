import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  executeCommand,
  listContacts,
  getDashboard,
  getContactDetails,
  createContact,
  logActivity,
} from '../client';
import type { Contact, DashboardData, ContactWithActivities, Activity } from '../../types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create Scout API response format
function createScoutResponse<T>(data: T): object {
  return {
    run: {
      state: {
        agent_message: {
          output: '```json\n' + JSON.stringify(data) + '\n```',
        },
      },
    },
  };
}

// Helper to create Scout API error response
function createScoutErrorResponse(errors: string[]): object {
  return {
    run: {
      stop_reason: 'workflow_run_failed',
      errors,
    },
  };
}

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('executeCommand', () => {
    it('sends request with correct headers and body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutResponse({ id: '123' })),
      });

      await executeCommand('test-api-key', 'TEST COMMAND');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-prod.scoutos.com/v2/workflows/wf_cmj94h2ij00010hs6hqatcw6x/execute',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          },
          body: JSON.stringify({ inputs: { message: 'TEST COMMAND' }, stream: false }),
        }
      );
    });

    it('returns success response when API returns valid data', async () => {
      const mockData = { id: '123', name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutResponse(mockData)),
      });

      const result = await executeCommand<typeof mockData>('api-key', 'COMMAND');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('returns error when API returns non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await executeCommand('invalid-key', 'COMMAND');

      expect(result.success).toBe(false);
      expect(result.error).toBe('API request failed: 401 Unauthorized');
    });

    it('returns error when API returns workflow_run_failed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutErrorResponse(['Database connection failed'])),
      });

      const result = await executeCommand('api-key', 'COMMAND');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await executeCommand('api-key', 'COMMAND');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('handles non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error');

      const result = await executeCommand('api-key', 'COMMAND');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });
  });

  describe('Response parsing', () => {
    it('parses JSON from content field (fallback)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: '{"id": "123"}' }),
      });

      const result = await executeCommand<{ id: string }>('api-key', 'COMMAND');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: '123' });
    });

    it('parses JSON from message field (fallback)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: '{"name": "Test"}' }),
      });

      const result = await executeCommand<{ name: string }>('api-key', 'COMMAND');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Test' });
    });

    it('parses JSON from Scout response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutResponse({ value: 42 })),
      });

      const result = await executeCommand<{ value: number }>('api-key', 'COMMAND');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ value: 42 });
    });

    it('parses JSON from output field (fallback)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ output: '{"status": "ok"}' }),
      });

      const result = await executeCommand<{ status: string }>('api-key', 'COMMAND');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ status: 'ok' });
    });

    it('extracts JSON from markdown code blocks', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: '```json\n{"extracted": true}\n```',
          }),
      });

      const result = await executeCommand<{ extracted: boolean }>('api-key', 'COMMAND');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ extracted: true });
    });

    it('extracts JSON from generic code blocks', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: '```\n{"generic": true}\n```',
          }),
      });

      const result = await executeCommand<{ generic: boolean }>('api-key', 'COMMAND');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ generic: true });
    });

    it('returns response directly if it has expected data shape', async () => {
      const contactData = { contacts: [{ id: '1', name: 'Test' }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(contactData),
      });

      const result = await executeCommand<typeof contactData>('api-key', 'COMMAND');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(contactData);
    });

    it('returns error when response cannot be parsed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: 'not valid json' }),
      });

      const result = await executeCommand('api-key', 'COMMAND');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to parse API response');
    });
  });

  describe('listContacts', () => {
    it('returns array of contacts', async () => {
      const mockContacts: Contact[] = [
        { id: '1', name: 'John', email: 'john@test.com', status: 'lead' },
        { id: '2', name: 'Jane', email: 'jane@test.com', status: 'customer' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutResponse(mockContacts)),
      });

      const result = await listContacts('api-key');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockContacts);
    });

    it('extracts contacts from wrapped response', async () => {
      const mockContacts: Contact[] = [{ id: '1', name: 'Test', email: 'test@test.com', status: 'lead' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutResponse({ contacts: mockContacts })),
      });

      const result = await listContacts('api-key');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockContacts);
    });

    it('returns empty array when contacts not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutResponse({})),
      });

      const result = await listContacts('api-key');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('normalizes document_id to id', async () => {
      const mockContacts = [
        { document_id: 'doc-1', name: 'John', email: 'john@test.com', status: 'lead' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutResponse(mockContacts)),
      });

      const result = await listContacts('api-key');

      expect(result.success).toBe(true);
      expect(result.data?.[0].id).toBe('doc-1');
    });
  });

  describe('getDashboard', () => {
    it('returns dashboard data', async () => {
      const mockDashboard: DashboardData = {
        contactCounts: { lead: 10, prospect: 5, customer: 3, total: 18 },
        activityCount: 25,
        recentActivities: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutResponse(mockDashboard)),
      });

      const result = await getDashboard('api-key');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDashboard);
    });
  });

  describe('getContactDetails', () => {
    it('returns contact with activities', async () => {
      const mockContact: ContactWithActivities = {
        id: '123',
        name: 'John Doe',
        email: 'john@test.com',
        status: 'prospect',
        activities: [
          {
            id: 'a1',
            contactId: '123',
            type: 'call',
            description: 'Initial call',
            timestamp: '2024-01-01T10:00:00Z',
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutResponse(mockContact)),
      });

      const result = await getContactDetails('api-key', '123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockContact);
    });
  });

  describe('createContact', () => {
    it('creates contact and returns result', async () => {
      const newContact: Contact = {
        id: 'new-123',
        name: 'New User',
        email: 'new@test.com',
        status: 'lead',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutResponse(newContact)),
      });

      const result = await createContact('api-key', {
        name: 'New User',
        email: 'new@test.com',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(newContact);
    });
  });

  describe('logActivity', () => {
    it('logs activity and returns result', async () => {
      const newActivity: Activity = {
        id: 'act-123',
        contactId: 'contact-456',
        type: 'call',
        description: 'Discovery call',
        outcome: 'Interested',
        timestamp: '2024-01-15T14:30:00Z',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createScoutResponse(newActivity)),
      });

      const result = await logActivity('api-key', {
        contactId: 'contact-456',
        type: 'call',
        description: 'Discovery call',
        outcome: 'Interested',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(newActivity);
    });
  });
});
