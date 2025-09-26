import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'e2e-test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should open payment modal when add credits is clicked', async ({ page }) => {
    // Click add credits button
    await page.click('text=Add Credits');

    // Should open payment modal
    await expect(page.locator('text=Add Credits to Your Wallet')).toBeVisible();
    await expect(page.locator('input[type="number"]')).toBeVisible();
  });

  test('should validate payment amount input', async ({ page }) => {
    // Open payment modal
    await page.click('text=Add Credits');

    // Try to enter invalid amount
    await page.fill('input[type="number"]', '0');
    
    // Submit button should be disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Try negative amount
    await page.fill('input[type="number"]', '-10');
    await expect(page.locator('text=Amount must be greater than 0')).toBeVisible();
  });

  test('should close payment modal when close button is clicked', async ({ page }) => {
    // Open payment modal
    await page.click('text=Add Credits');
    await expect(page.locator('text=Add Credits to Your Wallet')).toBeVisible();

    // Click close button
    await page.click('button[aria-label="Close"]');

    // Modal should be closed
    await expect(page.locator('text=Add Credits to Your Wallet')).not.toBeVisible();
  });

  test('should show payment form with valid amount', async ({ page }) => {
    // Open payment modal
    await page.click('text=Add Credits');

    // Enter valid amount
    await page.fill('input[type="number"]', '50');

    // Submit button should be enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });
});
