import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ContactDetail from '../ContactDetail.svelte';
import type { Contact, Activity } from '$lib/types';

const mockContact: Contact = {
	id: 'contact-1',
	name: 'John Doe',
	email: 'john@example.com',
	phone: '555-1234',
	company: 'Acme Corp',
	status: 'lead' as const
};

const mockActivities: Activity[] = [
	{
		id: 'act-1',
		contactId: 'contact-1',
		type: 'call',
		description: 'Discussed pricing',
		outcome: 'Follow up scheduled',
		timestamp: new Date().toISOString()
	}
];

describe('ContactDetail', () => {
	it('renders contact name', () => {
		render(ContactDetail, {
			props: { contact: mockContact, activities: mockActivities, loading: false }
		});
		expect(screen.getByText('John Doe')).toBeInTheDocument();
	});

	it('renders contact email', () => {
		render(ContactDetail, {
			props: { contact: mockContact, activities: mockActivities, loading: false }
		});
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
	});

	it('renders contact phone when provided', () => {
		render(ContactDetail, {
			props: { contact: mockContact, activities: mockActivities, loading: false }
		});
		expect(screen.getByText('555-1234')).toBeInTheDocument();
	});

	it('renders contact company when provided', () => {
		render(ContactDetail, {
			props: { contact: mockContact, activities: mockActivities, loading: false }
		});
		expect(screen.getByText('Acme Corp')).toBeInTheDocument();
	});

	it('shows status badge', () => {
		render(ContactDetail, {
			props: { contact: mockContact, activities: mockActivities, loading: false }
		});
		expect(screen.getByText('lead')).toBeInTheDocument();
	});

	it('renders all 4 action buttons (Call, Email, Meeting, Note)', () => {
		render(ContactDetail, {
			props: { contact: mockContact, activities: mockActivities, loading: false }
		});
		expect(screen.getByRole('button', { name: /Call/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Email/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Meeting/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Note/i })).toBeInTheDocument();
	});

	it("calls onLogActivity with 'call' when Call button clicked", async () => {
		const onLogActivity = vi.fn();
		render(ContactDetail, {
			props: {
				contact: mockContact,
				activities: mockActivities,
				loading: false,
				onLogActivity
			}
		});
		await fireEvent.click(screen.getByRole('button', { name: /Call/i }));
		expect(onLogActivity).toHaveBeenCalledWith('call');
	});

	it("calls onLogActivity with 'email' when Email button clicked", async () => {
		const onLogActivity = vi.fn();
		render(ContactDetail, {
			props: {
				contact: mockContact,
				activities: mockActivities,
				loading: false,
				onLogActivity
			}
		});
		await fireEvent.click(screen.getByRole('button', { name: /Email/i }));
		expect(onLogActivity).toHaveBeenCalledWith('email');
	});

	it("calls onLogActivity with 'meeting' when Meeting button clicked", async () => {
		const onLogActivity = vi.fn();
		render(ContactDetail, {
			props: {
				contact: mockContact,
				activities: mockActivities,
				loading: false,
				onLogActivity
			}
		});
		await fireEvent.click(screen.getByRole('button', { name: /Meeting/i }));
		expect(onLogActivity).toHaveBeenCalledWith('meeting');
	});

	it("calls onLogActivity with 'note' when Note button clicked", async () => {
		const onLogActivity = vi.fn();
		render(ContactDetail, {
			props: {
				contact: mockContact,
				activities: mockActivities,
				loading: false,
				onLogActivity
			}
		});
		await fireEvent.click(screen.getByRole('button', { name: /Note/i }));
		expect(onLogActivity).toHaveBeenCalledWith('note');
	});

	it('calls onClose when back button is clicked', async () => {
		const onClose = vi.fn();
		render(ContactDetail, {
			props: {
				contact: mockContact,
				activities: mockActivities,
				loading: false,
				onClose
			}
		});
		await fireEvent.click(screen.getByRole('button', { name: /Back/i }));
		expect(onClose).toHaveBeenCalled();
	});

	it('renders activity timeline', () => {
		render(ContactDetail, {
			props: { contact: mockContact, activities: mockActivities, loading: false }
		});
		expect(screen.getByText('Activity History')).toBeInTheDocument();
		expect(screen.getByText('Discussed pricing')).toBeInTheDocument();
	});

	it('renders loading state when loading=true', () => {
		const { container } = render(ContactDetail, {
			props: { contact: mockContact, activities: mockActivities, loading: true }
		});
		// Should render skeleton elements instead of text
		expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
		// Back button should still be visible and functional during loading
		expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
	});

	it('does not render phone when not provided', () => {
		const contactWithoutPhone: Contact = {
			...mockContact,
			phone: undefined
		};
		render(ContactDetail, {
			props: { contact: contactWithoutPhone, activities: mockActivities, loading: false }
		});
		expect(screen.queryByText('555-1234')).not.toBeInTheDocument();
	});

	it('does not render company when not provided', () => {
		const contactWithoutCompany: Contact = {
			...mockContact,
			company: undefined
		};
		render(ContactDetail, {
			props: { contact: contactWithoutCompany, activities: mockActivities, loading: false }
		});
		expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
	});
});
