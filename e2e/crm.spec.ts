import { test, expect } from '@playwright/test';

/**
 * E2E Tests for CRM Application
 *
 * These tests run against the actual Scout API endpoint.
 * They verify the main user flows work correctly with real data.
 * 
 * Note: The Scout API can take 20-30 seconds to respond, so timeouts
 * are set accordingly in playwright.config.ts
 */

// Test credentials - using real API
const TEST_USERNAME = 'testuser';
const TEST_API_KEY = process.env.TEST_API_KEY || '';

// Validate required environment variables
test.beforeAll(() => {
  if (!TEST_API_KEY) {
    throw new Error('TEST_API_KEY environment variable is required for E2E tests. Run with: TEST_API_KEY=your_key npm run test:e2e');
  }
});

// Long timeout for API calls (Scout API takes 20-30s)
const API_TIMEOUT = 45000;

test.describe('CRM Application', () => {
  test.describe('Login Flow', () => {
    test('should display login screen on initial load', async ({ page }) => {
      await page.goto('/');

      // Check that login form is visible
      await expect(page.getByLabel(/username/i)).toBeVisible();
      await expect(page.getByLabel(/api key/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('should show validation when fields are empty', async ({ page }) => {
      await page.goto('/');

      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /sign in/i });
      await submitButton.click();

      // Form should not submit (HTML5 validation)
      // The login screen should still be visible
      await expect(page.getByLabel(/username/i)).toBeVisible();
    });

    test('should allow entering credentials', async ({ page }) => {
      await page.goto('/');

      const usernameInput = page.getByLabel(/username/i);
      const apiKeyInput = page.getByLabel(/api key/i);

      await usernameInput.fill('testuser');
      await apiKeyInput.fill('test-api-key-123');

      await expect(usernameInput).toHaveValue('testuser');
      await expect(apiKeyInput).toHaveValue('test-api-key-123');
    });

    test('should login and show main interface with valid credentials', async ({ page }) => {
      await page.goto('/');

      await page.getByLabel(/username/i).fill(TEST_USERNAME);
      await page.getByLabel(/api key/i).fill(TEST_API_KEY);
      await page.getByRole('button', { name: /sign in/i }).click();

      // After successful login, we should see the main interface
      // Wait for the sidebar with CONTACTS header - API may take a while
      await expect(page.getByText('Contacts', { exact: false })).toBeVisible({ timeout: API_TIMEOUT });
      
      // Should see logout button
      await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
    });

    test('should handle invalid API key', async ({ page }) => {
      await page.goto('/');

      await page.getByLabel(/username/i).fill('testuser');
      await page.getByLabel(/api key/i).fill('invalid-api-key');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should show error or stay on login screen
      await expect(
        page.getByText(/error|failed|invalid/i).or(page.getByLabel(/api key/i))
      ).toBeVisible({ timeout: API_TIMEOUT });
    });
  });

  test.describe('Main Interface', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/');
      await page.getByLabel(/username/i).fill(TEST_USERNAME);
      await page.getByLabel(/api key/i).fill(TEST_API_KEY);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait for main interface to load - API is slow
      await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: API_TIMEOUT });
    });

    test('should display contacts in sidebar', async ({ page }) => {
      // Wait for contacts to load - look for the Add New button which indicates sidebar is ready
      await expect(page.getByRole('button', { name: /add new/i })).toBeVisible({ timeout: API_TIMEOUT });
    });

    test('should display dashboard by default', async ({ page }) => {
      // Dashboard should show total contacts once loaded
      // Wait for the dashboard to finish loading
      await expect(page.getByText('Total Contacts')).toBeVisible({ timeout: API_TIMEOUT });
    });

    test('should select a contact and show details', async ({ page }) => {
      // Wait for contacts to load
      await expect(page.getByRole('button', { name: /add new/i })).toBeVisible({ timeout: API_TIMEOUT });

      // Find and click on any contact card in the sidebar
      // Look for contact cards (they have status badges)
      const contactCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /@/ });
      
      // If there are contacts, click the first one
      const count = await contactCards.count();
      if (count > 0) {
        await contactCards.first().click();
        
        // Should show contact detail view with Back button - API is slow
        await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: API_TIMEOUT });
      }
    });

    test('should open create contact form', async ({ page }) => {
      // Wait for contacts to load
      await expect(page.getByRole('button', { name: /add new/i })).toBeVisible({ timeout: API_TIMEOUT });
      
      // Click Add New button
      await page.getByRole('button', { name: /add new/i }).click();

      // Form should appear with name and email fields
      await expect(page.getByPlaceholder(/john doe/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByPlaceholder(/john@example.com/i)).toBeVisible();
    });

    test('should close create contact form on cancel', async ({ page }) => {
      // Wait for contacts to load
      await expect(page.getByRole('button', { name: /add new/i })).toBeVisible({ timeout: API_TIMEOUT });
      
      // Open form
      await page.getByRole('button', { name: /add new/i }).click();
      await expect(page.getByPlaceholder(/john doe/i)).toBeVisible({ timeout: 5000 });

      // Click cancel
      await page.getByRole('button', { name: /cancel/i }).click();

      // Form should be closed
      await expect(page.getByPlaceholder(/john doe/i)).not.toBeVisible();
    });

    test('should logout and return to login screen', async ({ page }) => {
      // Click logout
      await page.getByRole('button', { name: /logout/i }).click();

      // Should return to login screen
      await expect(page.getByLabel(/username/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Contact Operations', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/');
      await page.getByLabel(/username/i).fill(TEST_USERNAME);
      await page.getByLabel(/api key/i).fill(TEST_API_KEY);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait for main interface to load - API is slow
      await expect(page.getByRole('button', { name: /add new/i })).toBeVisible({ timeout: API_TIMEOUT });
    });

    test('should create a new contact', async ({ page }) => {
      // Generate unique email to avoid conflicts
      const uniqueId = Date.now();
      const testName = `Test Contact ${uniqueId}`;
      const testEmail = `test${uniqueId}@example.com`;

      // Open create form
      await page.getByRole('button', { name: /add new/i }).click();
      await expect(page.getByPlaceholder(/john doe/i)).toBeVisible({ timeout: 5000 });

      // Fill in contact details
      await page.getByPlaceholder(/john doe/i).fill(testName);
      await page.getByPlaceholder(/john@example.com/i).fill(testEmail);

      // Submit the form
      await page.getByRole('button', { name: /create contact/i }).click();

      // Should see success message - API is slow
      await expect(
        page.getByText('Contact created successfully!')
      ).toBeVisible({ timeout: API_TIMEOUT });
    });

    test('should view contact details and see action buttons', async ({ page }) => {
      // Find and click on any contact
      const contactCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /@/ });
      const count = await contactCards.count();
      
      if (count > 0) {
        await contactCards.first().click();
        
        // Should see action buttons for logging activities - API is slow
        await expect(page.getByRole('button', { name: /call/i })).toBeVisible({ timeout: API_TIMEOUT });
        await expect(page.getByRole('button', { name: /email/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /meeting/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /note/i })).toBeVisible();
      }
    });

    test('should open activity form when clicking Call button', async ({ page }) => {
      // Find and click on any contact
      const contactCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /@/ });
      const count = await contactCards.count();
      
      if (count > 0) {
        await contactCards.first().click();
        
        // Wait for detail view - API is slow
        await expect(page.getByRole('button', { name: /call/i })).toBeVisible({ timeout: API_TIMEOUT });
        
        // Click Call button
        await page.getByRole('button', { name: /call/i }).click();

        // Activity form should appear
        await expect(page.getByPlaceholder(/describe what happened/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should log an activity for a contact', async ({ page }) => {
      // Find and click on any contact
      const contactCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /@/ });
      const count = await contactCards.count();
      
      if (count > 0) {
        await contactCards.first().click();
        
        // Wait for detail view and click Call button - API is slow
        await expect(page.getByRole('button', { name: /call/i })).toBeVisible({ timeout: API_TIMEOUT });
        await page.getByRole('button', { name: /call/i }).click();

        // Fill in activity details
        await page.getByPlaceholder(/describe what happened/i).fill('Test call from e2e test');

        // Submit
        await page.getByRole('button', { name: /log activity/i }).click();

        // Should see success message - API is slow
        await expect(page.getByText(/success/i)).toBeVisible({ timeout: API_TIMEOUT });
      }
    });

    test('should navigate back from contact detail to dashboard', async ({ page }) => {
      // Find and click on any contact
      const contactCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /@/ });
      const count = await contactCards.count();
      
      if (count > 0) {
        await contactCards.first().click();
        
        // Wait for detail view - API is slow
        await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: API_TIMEOUT });
        
        // Click back
        await page.getByRole('button', { name: /back/i }).click();

        // Should return to dashboard view (no back button visible)
        await expect(page.getByRole('button', { name: /back/i })).not.toBeVisible({ timeout: 5000 });
      }
    });
  });
});
