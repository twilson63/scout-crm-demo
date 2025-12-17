import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Dashboard from '../Dashboard.svelte';
import type { DashboardData } from '$lib/types';

const mockDashboardData: DashboardData = {
	contactCounts: { lead: 5, prospect: 3, customer: 2, total: 10 },
	activityCount: 25,
	recentActivities: [
		{
			id: 'act-1',
			contactId: 'c-1',
			type: 'call',
			description: 'Called about pricing',
			timestamp: new Date().toISOString()
		}
	]
};

describe('Dashboard', () => {
	it('renders loading state when loading=true', () => {
		const { container } = render(Dashboard, { props: { data: null, loading: true } });
		// Should render skeleton elements instead of text
		expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
	});

	it('renders dashboard stats when data is provided', () => {
		render(Dashboard, { props: { data: mockDashboardData, loading: false } });
		expect(screen.getByText('Total Contacts')).toBeInTheDocument();
		expect(screen.getByText('By Status')).toBeInTheDocument();
		expect(screen.getByText('Total Activities')).toBeInTheDocument();
	});

	it('shows total contacts count', () => {
		render(Dashboard, { props: { data: mockDashboardData, loading: false } });
		expect(screen.getByText('10')).toBeInTheDocument();
	});

	it('shows status breakdown (lead, prospect, customer counts)', () => {
		render(Dashboard, { props: { data: mockDashboardData, loading: false } });
		expect(screen.getByText('Lead')).toBeInTheDocument();
		expect(screen.getByText('5')).toBeInTheDocument();
		expect(screen.getByText('Prospect')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
		expect(screen.getByText('Customer')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument();
	});

	it('shows activities count', () => {
		render(Dashboard, { props: { data: mockDashboardData, loading: false } });
		expect(screen.getByText('25')).toBeInTheDocument();
	});

	it('renders recent activities section', () => {
		render(Dashboard, { props: { data: mockDashboardData, loading: false } });
		expect(screen.getByText('Recent Activities')).toBeInTheDocument();
		expect(screen.getByText('Called about pricing')).toBeInTheDocument();
	});

	it('shows "Select a contact" message', () => {
		render(Dashboard, { props: { data: mockDashboardData, loading: false } });
		expect(screen.getByText('Select a contact to view details')).toBeInTheDocument();
	});

	it('handles null data gracefully', () => {
		render(Dashboard, { props: { data: null, loading: false } });
		expect(screen.getByText('No dashboard data available')).toBeInTheDocument();
	});

	it('handles empty recent activities gracefully', () => {
		const emptyActivitiesData: DashboardData = {
			...mockDashboardData,
			recentActivities: []
		};
		render(Dashboard, { props: { data: emptyActivitiesData, loading: false } });
		expect(screen.getByText('No activities yet')).toBeInTheDocument();
	});
});
