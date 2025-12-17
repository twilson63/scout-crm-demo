import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import LoginScreen from '../LoginScreen.svelte';

describe('LoginScreen', () => {
	it('renders login form with username and API key inputs', () => {
		render(LoginScreen, { props: {} });

		expect(screen.getByLabelText('Username')).toBeInTheDocument();
		expect(screen.getByLabelText('API Key')).toBeInTheDocument();
	});

	it('renders sign in button', () => {
		render(LoginScreen, { props: {} });

		const signInButton = screen.getByRole('button', { name: 'Sign In' });
		expect(signInButton).toBeInTheDocument();
	});

	it('submit button exists and is clickable', async () => {
		render(LoginScreen, { props: {} });

		const submitButton = screen.getByRole('button', { name: 'Sign In' });
		expect(submitButton).toBeInTheDocument();
		expect(submitButton).toHaveAttribute('type', 'submit');

		// Verify it's clickable (not disabled)
		await fireEvent.click(submitButton);
	});

	it('calls onlogin callback with credentials when form is submitted', async () => {
		const mockOnLogin = vi.fn();
		render(LoginScreen, { props: { onlogin: mockOnLogin } });

		const usernameInput = screen.getByLabelText('Username');
		const apiKeyInput = screen.getByLabelText('API Key');
		const submitButton = screen.getByRole('button', { name: 'Sign In' });

		await fireEvent.input(usernameInput, { target: { value: 'testuser' } });
		await fireEvent.input(apiKeyInput, { target: { value: 'testapikey123' } });
		await fireEvent.click(submitButton);

		expect(mockOnLogin).toHaveBeenCalledTimes(1);
		expect(mockOnLogin).toHaveBeenCalledWith({
			username: 'testuser',
			apiKey: 'testapikey123'
		});
	});

	it('trims whitespace from input values', async () => {
		const mockOnLogin = vi.fn();
		render(LoginScreen, { props: { onlogin: mockOnLogin } });

		const usernameInput = screen.getByLabelText('Username');
		const apiKeyInput = screen.getByLabelText('API Key');
		const submitButton = screen.getByRole('button', { name: 'Sign In' });

		await fireEvent.input(usernameInput, { target: { value: '  testuser  ' } });
		await fireEvent.input(apiKeyInput, { target: { value: '  testapikey123  ' } });
		await fireEvent.click(submitButton);

		expect(mockOnLogin).toHaveBeenCalledWith({
			username: 'testuser',
			apiKey: 'testapikey123'
		});
	});
});
