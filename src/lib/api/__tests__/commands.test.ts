import { describe, it, expect } from 'vitest';
import {
  listContactsCommand,
  createContactCommand,
  logActivityCommand,
  getDashboardCommand,
  getContactDetailsCommand,
  getContactActivitiesCommand,
  updateContactStatusCommand,
  searchContactsCommand,
} from '../commands';
import type { CreateContactData, LogActivityData } from '../../types';

describe('NL Command Builders', () => {
  describe('listContactsCommand', () => {
    it('returns a command that requests contacts in JSON format', () => {
      const command = listContactsCommand();
      expect(command).toContain('contacts');
      expect(command).toContain('JSON');
      expect(command).toContain('```json');
    });

    it('does not include any dynamic parameters', () => {
      const command1 = listContactsCommand();
      const command2 = listContactsCommand();
      expect(command1).toBe(command2);
    });
  });

  describe('getDashboardCommand', () => {
    it('returns a command that requests dashboard data in JSON format', () => {
      const command = getDashboardCommand();
      expect(command).toContain('dashboard');
      expect(command).toContain('JSON');
      expect(command).toContain('contactCounts');
      expect(command).toContain('5'); // default limit
    });

    it('accepts custom activity limit', () => {
      const command = getDashboardCommand(10);
      expect(command).toContain('10');
    });
  });

  describe('getContactDetailsCommand', () => {
    it('returns a command with contact ID that requests JSON format', () => {
      const command = getContactDetailsCommand('contact-123');
      expect(command).toContain('contact-123');
      expect(command).toContain('JSON');
      expect(command).toContain('activities');
    });
  });

  describe('getContactActivitiesCommand', () => {
    it('returns a command with contact ID that requests JSON format', () => {
      const command = getContactActivitiesCommand('contact-456');
      expect(command).toContain('contact-456');
      expect(command).toContain('JSON');
      expect(command).toContain('activities');
    });
  });

  describe('createContactCommand', () => {
    it('includes required fields name and email', () => {
      const data: CreateContactData = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      const command = createContactCommand(data);
      expect(command).toContain('John Doe');
      expect(command).toContain('john@example.com');
      expect(command).toContain('JSON');
    });

    it('includes company when provided', () => {
      const data: CreateContactData = {
        name: 'Jane Smith',
        email: 'jane@acme.com',
        company: 'Acme Corp',
      };
      const command = createContactCommand(data);
      expect(command).toContain('Acme Corp');
    });

    it('includes phone when provided', () => {
      const data: CreateContactData = {
        name: 'Bob Wilson',
        email: 'bob@test.com',
        phone: '555-1234',
      };
      const command = createContactCommand(data);
      expect(command).toContain('555-1234');
    });

    it('includes all optional fields when provided', () => {
      const data: CreateContactData = {
        name: 'Alice Brown',
        email: 'alice@company.com',
        company: 'Big Corp',
        phone: '555-9999',
        status: 'prospect',
      };
      const command = createContactCommand(data);
      expect(command).toContain('Alice Brown');
      expect(command).toContain('alice@company.com');
      expect(command).toContain('Big Corp');
      expect(command).toContain('555-9999');
      expect(command).toContain('prospect');
    });

    it('uses default status when not provided', () => {
      const data: CreateContactData = {
        name: 'Test User',
        email: 'test@test.com',
      };
      const command = createContactCommand(data);
      expect(command).toContain('lead');
    });

    it('uses provided status', () => {
      const data: CreateContactData = {
        name: 'Customer User',
        email: 'customer@test.com',
        status: 'customer',
      };
      const command = createContactCommand(data);
      expect(command).toContain('customer');
    });
  });

  describe('logActivityCommand', () => {
    it('includes contact ID, type, and description for call activity', () => {
      const data: LogActivityData = {
        contactId: 'contact-789',
        type: 'call',
        description: 'Discussed pricing options',
      };
      const command = logActivityCommand(data);
      expect(command).toContain('contact-789');
      expect(command).toContain('call');
      expect(command).toContain('Discussed pricing options');
      expect(command).toContain('JSON');
    });

    it('includes type for email activity', () => {
      const data: LogActivityData = {
        contactId: 'contact-123',
        type: 'email',
        description: 'Sent proposal document',
      };
      const command = logActivityCommand(data);
      expect(command).toContain('email');
    });

    it('includes type for meeting activity', () => {
      const data: LogActivityData = {
        contactId: 'contact-456',
        type: 'meeting',
        description: 'Quarterly review meeting',
      };
      const command = logActivityCommand(data);
      expect(command).toContain('meeting');
    });

    it('includes type for note activity', () => {
      const data: LogActivityData = {
        contactId: 'contact-789',
        type: 'note',
        description: 'Follow up next week',
      };
      const command = logActivityCommand(data);
      expect(command).toContain('note');
    });

    it('includes outcome when provided', () => {
      const data: LogActivityData = {
        contactId: 'contact-123',
        type: 'call',
        description: 'Discovery call',
        outcome: 'Interested in demo',
      };
      const command = logActivityCommand(data);
      expect(command).toContain('Interested in demo');
    });

    it('does not include outcome when not provided', () => {
      const data: LogActivityData = {
        contactId: 'contact-456',
        type: 'email',
        description: 'Welcome email',
      };
      const command = logActivityCommand(data);
      expect(command).not.toContain('outcome:');
    });
  });

  describe('updateContactStatusCommand', () => {
    it('includes contact ID and new status', () => {
      const command = updateContactStatusCommand('contact-123', 'prospect');
      expect(command).toContain('contact-123');
      expect(command).toContain('prospect');
      expect(command).toContain('JSON');
    });
  });

  describe('searchContactsCommand', () => {
    it('includes search query and requests JSON', () => {
      const command = searchContactsCommand('Acme');
      expect(command).toContain('Acme');
      expect(command).toContain('JSON');
    });
  });

  describe('string escaping', () => {
    it('escapes single quotes in name', () => {
      const data: CreateContactData = {
        name: "O'Brien",
        email: 'obrien@test.com',
      };
      const command = createContactCommand(data);
      expect(command).toContain("O\\'Brien");
    });

    it('escapes single quotes in description', () => {
      const data: LogActivityData = {
        contactId: 'contact-123',
        type: 'note',
        description: "Customer said 'yes' to proposal",
      };
      const command = logActivityCommand(data);
      expect(command).toContain("Customer said \\'yes\\' to proposal");
    });

    it('escapes multiple single quotes', () => {
      const data: CreateContactData = {
        name: "D'Angelo O'Neil",
        email: 'test@test.com',
      };
      const command = createContactCommand(data);
      expect(command).toContain("D\\'Angelo O\\'Neil");
    });

    it('escapes single quotes in company', () => {
      const data: CreateContactData = {
        name: 'Test User',
        email: 'test@test.com',
        company: "Ben & Jerry's",
      };
      const command = createContactCommand(data);
      expect(command).toContain("Ben & Jerry\\'s");
    });

    it('escapes single quotes in search query', () => {
      const command = searchContactsCommand("O'Malley");
      expect(command).toContain("O\\'Malley");
    });

    it('escapes single quotes in outcome', () => {
      const data: LogActivityData = {
        contactId: 'contact-123',
        type: 'call',
        description: 'Call completed',
        outcome: "They'll call back",
      };
      const command = logActivityCommand(data);
      expect(command).toContain("They\\'ll call back");
    });
  });
});
