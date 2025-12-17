import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ContactList from '../ContactList.svelte';
import type { Contact } from '$lib/types';

const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    company: 'Acme Corp',
    status: 'lead' as const
  },
  {
    id: 'contact-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    company: 'Tech Inc',
    status: 'prospect' as const
  },
  {
    id: 'contact-3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    status: 'customer' as const
  }
];

describe('ContactList', () => {
  it('renders "Add New" button', () => {
    render(ContactList, { props: { contacts: mockContacts } });
    expect(screen.getByRole('button', { name: 'Add New' })).toBeInTheDocument();
  });

  it('renders all contacts in the list', () => {
    render(ContactList, { props: { contacts: mockContacts } });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
  });

  it('calls onselect callback when contact is clicked', async () => {
    const handleSelect = vi.fn();
    render(ContactList, { props: { contacts: mockContacts, onselect: handleSelect } });
    
    // Get all buttons and click the first contact (not the "Add New" button)
    const contactButtons = screen.getAllByRole('button');
    // The first button is "Add New", so click the second one (first contact)
    await fireEvent.click(contactButtons[1]);
    
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith('contact-1');
  });

  it('calls onadd callback when "Add New" is clicked', async () => {
    const handleAdd = vi.fn();
    render(ContactList, { props: { contacts: mockContacts, onadd: handleAdd } });
    
    const addButton = screen.getByRole('button', { name: 'Add New' });
    await fireEvent.click(addButton);
    
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when contacts array is empty', () => {
    render(ContactList, { props: { contacts: [] } });
    expect(screen.getByText('No contacts yet')).toBeInTheDocument();
  });

  it('highlights the selected contact', () => {
    render(ContactList, { props: { contacts: mockContacts, selectedId: 'contact-2' } });
    
    // Get all buttons (first is "Add New", rest are contacts)
    const buttons = screen.getAllByRole('button');
    
    // Contact buttons are buttons 1, 2, 3 (index 0 is "Add New")
    // contact-1 is at index 1, contact-2 is at index 2, contact-3 is at index 3
    const contact1Button = buttons[1];
    const contact2Button = buttons[2];
    const contact3Button = buttons[3];
    
    // Selected contact (contact-2) should have selected styling
    expect(contact2Button.className).toContain('border-gray-400');
    expect(contact2Button.className).toContain('bg-gray-100');
    
    // Other contacts should not have selected styling
    expect(contact1Button.className).toContain('border-gray-200');
    expect(contact3Button.className).toContain('border-gray-200');
  });
});
