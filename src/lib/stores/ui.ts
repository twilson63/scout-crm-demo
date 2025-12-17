/**
 * UI State Store
 * 
 * Manages UI state like form visibility and error messages.
 */

import { writable } from 'svelte/store';
import type { ActivityType } from '../types';

/**
 * Whether the contact creation/edit form is visible
 */
export const showContactForm = writable<boolean>(false);

/**
 * Whether the activity logging form is visible
 */
export const showActivityForm = writable<boolean>(false);

/**
 * The type of activity being logged (if activity form is open)
 */
export const activityFormType = writable<ActivityType | null>(null);

/**
 * Global error message to display
 */
export const error = writable<string | null>(null);

/**
 * Success message to display
 */
export const successMessage = writable<string | null>(null);

/**
 * Open the contact form
 */
export function openContactForm(): void {
  showContactForm.set(true);
}

/**
 * Close the contact form
 */
export function closeContactForm(): void {
  showContactForm.set(false);
}

/**
 * Open the activity form with a specific type
 */
export function openActivityForm(type: ActivityType): void {
  activityFormType.set(type);
  showActivityForm.set(true);
}

/**
 * Close the activity form
 */
export function closeActivityForm(): void {
  showActivityForm.set(false);
  activityFormType.set(null);
}

/**
 * Set an error message (auto-clears after delay)
 */
export function setError(message: string, autoClearMs: number = 5000): void {
  error.set(message);
  if (autoClearMs > 0) {
    setTimeout(() => {
      error.update((current) => (current === message ? null : current));
    }, autoClearMs);
  }
}

/**
 * Clear the error message
 */
export function clearError(): void {
  error.set(null);
}

/**
 * Set a success message (auto-clears after delay)
 */
export function setSuccess(message: string, autoClearMs: number = 3000): void {
  successMessage.set(message);
  if (autoClearMs > 0) {
    setTimeout(() => {
      successMessage.update((current) => (current === message ? null : current));
    }, autoClearMs);
  }
}

/**
 * Clear the success message
 */
export function clearSuccess(): void {
  successMessage.set(null);
}
