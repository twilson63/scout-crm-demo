/**
 * Contacts Store
 * 
 * Manages contact data, selection state, and dashboard data.
 */

import { writable, derived } from 'svelte/store';
import type { Contact, ContactWithActivities, DashboardData } from '../types';

/**
 * List of all contacts
 */
export const contacts = writable<Contact[]>([]);

/**
 * Currently selected contact ID
 */
export const selectedContactId = writable<string | null>(null);

/**
 * Detailed contact data (with activities) for the selected contact
 */
export const selectedContactDetails = writable<ContactWithActivities | null>(null);

/**
 * Derived store that returns the selected contact from the contacts list
 * For basic contact info without activities
 */
export const selectedContact = derived(
  [contacts, selectedContactId],
  ([$contacts, $selectedContactId]) => {
    if (!$selectedContactId) return null;
    return $contacts.find((c) => c.id === $selectedContactId) ?? null;
  }
);

/**
 * Dashboard data including contact counts and recent activities
 */
export const dashboardData = writable<DashboardData | null>(null);

/**
 * Loading state for async operations
 */
export const isLoading = writable<boolean>(false);

/**
 * Helper to update a single contact in the list
 */
export function updateContact(contactId: string, updates: Partial<Contact>): void {
  contacts.update((list) =>
    list.map((contact) =>
      contact.id === contactId ? { ...contact, ...updates } : contact
    )
  );
}

/**
 * Helper to add a new contact to the list
 */
export function addContact(contact: Contact): void {
  contacts.update((list) => [...list, contact]);
}

/**
 * Helper to remove a contact from the list
 */
export function removeContact(contactId: string): void {
  contacts.update((list) => list.filter((c) => c.id !== contactId));
  
  // Clear selection if the removed contact was selected
  selectedContactId.update((id) => (id === contactId ? null : id));
}

/**
 * Clear all contact state
 */
export function clearContacts(): void {
  contacts.set([]);
  selectedContactId.set(null);
  selectedContactDetails.set(null);
  dashboardData.set(null);
}
