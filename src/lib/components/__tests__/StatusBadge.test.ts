import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../StatusBadge.svelte';

describe('StatusBadge', () => {
	it('renders "lead" badge with correct class (badge-lead)', () => {
		render(StatusBadge, { props: { status: 'lead' } });
		const badge = screen.getByText('Lead');
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveClass('badge-lead');
	});

	it('renders "prospect" badge with correct class (badge-prospect)', () => {
		render(StatusBadge, { props: { status: 'prospect' } });
		const badge = screen.getByText('Prospect');
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveClass('badge-prospect');
	});

	it('renders "customer" badge with correct class (badge-customer)', () => {
		render(StatusBadge, { props: { status: 'customer' } });
		const badge = screen.getByText('Customer');
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveClass('badge-customer');
	});

	it('displays the status text (capitalized)', () => {
		render(StatusBadge, { props: { status: 'lead' } });
		expect(screen.getByText('Lead')).toBeInTheDocument();

		// Clean up and test another status
		render(StatusBadge, { props: { status: 'prospect' } });
		expect(screen.getByText('Prospect')).toBeInTheDocument();

		render(StatusBadge, { props: { status: 'customer' } });
		expect(screen.getByText('Customer')).toBeInTheDocument();
	});
});
