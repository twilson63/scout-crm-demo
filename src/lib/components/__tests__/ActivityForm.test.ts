import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ActivityForm from '../ActivityForm.svelte';
import type { ActivityType } from '$lib/types';

describe('ActivityForm', () => {
	const defaultProps = {
		contactId: 'contact-123',
		activityType: 'call' as ActivityType,
		onsubmit: vi.fn(),
		oncancel: vi.fn()
	};

	it('renders form with description and outcome fields', () => {
		render(ActivityForm, { props: defaultProps });

		expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/outcome/i)).toBeInTheDocument();
	});

	it('shows correct activity type label for Call', () => {
		render(ActivityForm, {
			props: { ...defaultProps, activityType: 'call' as ActivityType }
		});

		expect(screen.getByText('Log Call')).toBeInTheDocument();
	});

	it('shows correct activity type label for Email', () => {
		render(ActivityForm, {
			props: { ...defaultProps, activityType: 'email' as ActivityType }
		});

		expect(screen.getByText('Log Email')).toBeInTheDocument();
	});

	it('shows correct activity type label for Meeting', () => {
		render(ActivityForm, {
			props: { ...defaultProps, activityType: 'meeting' as ActivityType }
		});

		expect(screen.getByText('Log Meeting')).toBeInTheDocument();
	});

	it('shows correct activity type label for Note', () => {
		render(ActivityForm, {
			props: { ...defaultProps, activityType: 'note' as ActivityType }
		});

		expect(screen.getByText('Log Note')).toBeInTheDocument();
	});

	it('description field is required', async () => {
		render(ActivityForm, { props: defaultProps });

		const descriptionInput = screen.getByLabelText(/description/i);
		// Type whitespace to trigger error display (error shows when value !== '' but trim() is empty)
		await fireEvent.input(descriptionInput, { target: { value: '   ' } });

		expect(screen.getByText('Description is required')).toBeInTheDocument();
	});

	it('submit button is disabled when description is empty', () => {
		render(ActivityForm, { props: defaultProps });

		const submitButton = screen.getByRole('button', { name: /log activity/i });
		expect(submitButton).toBeDisabled();
	});

	it('submit button is enabled when description is filled', async () => {
		render(ActivityForm, { props: defaultProps });

		const descriptionInput = screen.getByLabelText(/description/i);
		await fireEvent.input(descriptionInput, { target: { value: 'Called to discuss proposal' } });

		const submitButton = screen.getByRole('button', { name: /log activity/i });
		expect(submitButton).not.toBeDisabled();
	});

	it('calls onsubmit with activity data when submitted', async () => {
		const mockOnSubmit = vi.fn();
		render(ActivityForm, {
			props: {
				contactId: 'contact-456',
				activityType: 'meeting' as ActivityType,
				onsubmit: mockOnSubmit,
				oncancel: vi.fn()
			}
		});

		const descriptionInput = screen.getByLabelText(/description/i);
		const outcomeInput = screen.getByLabelText(/outcome/i);

		await fireEvent.input(descriptionInput, { target: { value: 'Met to discuss Q4 plans' } });
		await fireEvent.input(outcomeInput, { target: { value: 'Scheduled follow-up' } });

		const form = document.querySelector('form')!;
		await fireEvent.submit(form);

		expect(mockOnSubmit).toHaveBeenCalledTimes(1);
		expect(mockOnSubmit).toHaveBeenCalledWith({
			contactId: 'contact-456',
			type: 'meeting',
			description: 'Met to discuss Q4 plans',
			outcome: 'Scheduled follow-up'
		});
	});

	it('calls oncancel when cancel button is clicked', async () => {
		const mockOnCancel = vi.fn();
		render(ActivityForm, {
			props: {
				...defaultProps,
				oncancel: mockOnCancel
			}
		});

		const cancelButton = screen.getByRole('button', { name: /cancel/i });
		await fireEvent.click(cancelButton);

		expect(mockOnCancel).toHaveBeenCalledTimes(1);
	});

	it('outcome field is optional', async () => {
		const mockOnSubmit = vi.fn();
		render(ActivityForm, {
			props: {
				contactId: 'contact-789',
				activityType: 'note' as ActivityType,
				onsubmit: mockOnSubmit,
				oncancel: vi.fn()
			}
		});

		const descriptionInput = screen.getByLabelText(/description/i);
		// Only fill required field
		await fireEvent.input(descriptionInput, { target: { value: 'Quick note about the call' } });

		const form = document.querySelector('form')!;
		await fireEvent.submit(form);

		expect(mockOnSubmit).toHaveBeenCalledTimes(1);
		// Should not include outcome when not provided
		expect(mockOnSubmit).toHaveBeenCalledWith({
			contactId: 'contact-789',
			type: 'note',
			description: 'Quick note about the call'
		});
	});
});
