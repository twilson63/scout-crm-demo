import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ContactForm from '../ContactForm.svelte';

describe('ContactForm', () => {
	const defaultProps = {
		onsubmit: vi.fn(),
		oncancel: vi.fn()
	};

	it('renders form with all fields (name, email, phone, company)', () => {
		render(ContactForm, { props: defaultProps });

		expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
	});

	it('name field is required (shows error when whitespace-only after interaction)', async () => {
		render(ContactForm, { props: defaultProps });

		const nameInput = screen.getByLabelText(/name/i);
		// Type whitespace to trigger error display (error shows when value !== '' but trim() is empty)
		await fireEvent.input(nameInput, { target: { value: '   ' } });

		expect(screen.getByText('Name is required')).toBeInTheDocument();
	});

	it('email field is required (submit button disabled when email empty)', async () => {
		render(ContactForm, { props: defaultProps });

		const nameInput = screen.getByLabelText(/name/i);
		// Fill only name, leave email empty
		await fireEvent.input(nameInput, { target: { value: 'John Doe' } });

		// Submit should still be disabled because email is empty
		const submitButton = screen.getByRole('button', { name: /create contact/i });
		expect(submitButton).toBeDisabled();
	});

	it('submit button is disabled when required fields are empty', () => {
		render(ContactForm, { props: defaultProps });

		const submitButton = screen.getByRole('button', { name: /create contact/i });
		expect(submitButton).toBeDisabled();
	});

	it('submit button is enabled when required fields are filled', async () => {
		render(ContactForm, { props: defaultProps });

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);

		await fireEvent.input(nameInput, { target: { value: 'John Doe' } });
		await fireEvent.input(emailInput, { target: { value: 'john@example.com' } });

		const submitButton = screen.getByRole('button', { name: /create contact/i });
		expect(submitButton).not.toBeDisabled();
	});

	it('calls onsubmit with form data when submitted', async () => {
		const mockOnSubmit = vi.fn();
		render(ContactForm, {
			props: {
				onsubmit: mockOnSubmit,
				oncancel: vi.fn()
			}
		});

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const phoneInput = screen.getByLabelText(/phone/i);
		const companyInput = screen.getByLabelText(/company/i);

		await fireEvent.input(nameInput, { target: { value: 'John Doe' } });
		await fireEvent.input(emailInput, { target: { value: 'john@example.com' } });
		await fireEvent.input(phoneInput, { target: { value: '555-1234' } });
		await fireEvent.input(companyInput, { target: { value: 'Acme Corp' } });

		const form = document.querySelector('form')!;
		await fireEvent.submit(form);

		expect(mockOnSubmit).toHaveBeenCalledTimes(1);
		expect(mockOnSubmit).toHaveBeenCalledWith({
			name: 'John Doe',
			email: 'john@example.com',
			phone: '555-1234',
			company: 'Acme Corp',
			status: 'lead'
		});
	});

	it('calls oncancel when cancel button is clicked', async () => {
		const mockOnCancel = vi.fn();
		render(ContactForm, {
			props: {
				onsubmit: vi.fn(),
				oncancel: mockOnCancel
			}
		});

		const cancelButton = screen.getByRole('button', { name: /cancel/i });
		await fireEvent.click(cancelButton);

		expect(mockOnCancel).toHaveBeenCalledTimes(1);
	});

	it('phone and company are optional fields', async () => {
		const mockOnSubmit = vi.fn();
		render(ContactForm, {
			props: {
				onsubmit: mockOnSubmit,
				oncancel: vi.fn()
			}
		});

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);

		// Only fill required fields
		await fireEvent.input(nameInput, { target: { value: 'John Doe' } });
		await fireEvent.input(emailInput, { target: { value: 'john@example.com' } });

		const form = document.querySelector('form')!;
		await fireEvent.submit(form);

		expect(mockOnSubmit).toHaveBeenCalledTimes(1);
		// Should not include phone or company when not provided
		expect(mockOnSubmit).toHaveBeenCalledWith({
			name: 'John Doe',
			email: 'john@example.com',
			status: 'lead'
		});
	});
});
