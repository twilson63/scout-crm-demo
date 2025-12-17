import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ContactCard from '../ContactCard.svelte';
import type { Contact } from '$lib/types';

const mockContact: Contact = {
  id: 'contact-1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',
  company: 'Acme Corp',
  status: 'lead' as const
};

describe('ContactCard', () => {
  it('renders contact name', () => {
    render(ContactCard, { props: { contact: mockContact } });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders company when provided', () => {
    render(ContactCard, { props: { contact: mockContact } });
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('does not render company when not provided', () => {
    const contactWithoutCompany: Contact = {
      id: 'contact-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'prospect' as const
    };
    render(ContactCard, { props: { contact: contactWithoutCompany } });
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it('shows StatusBadge with correct status', () => {
    render(ContactCard, { props: { contact: mockContact } });
    // StatusBadge capitalizes the first letter of status
    expect(screen.getByText('Lead')).toBeInTheDocument();
  });

  it('applies selected styling when selected=true', () => {
    render(ContactCard, { props: { contact: mockContact, selected: true } });
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-gray-400');
    expect(button.className).toContain('bg-gray-100');
  });

  it('does not apply selected styling when selected=false', () => {
    render(ContactCard, { props: { contact: mockContact, selected: false } });
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-gray-200');
    expect(button.className).toContain('bg-white');
  });

  it('calls onclick callback when clicked', async () => {
    const handleClick = vi.fn();
    render(ContactCard, { props: { contact: mockContact, onclick: handleClick } });
    const button = screen.getByRole('button');
    await fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
