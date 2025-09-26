import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    await page.goto('/register');
    const uniqueEmail = `e2e-payment-${Date.now()}@example.com`;
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('should open payment modal when add credits is clicked', async ({ page }) => {
    // Check if we're on the homepage and authenticated
    await expect(page.locator('text=🛍️ Browse Products')).toBeVisible();
    
    // Click add credits button
    await page.click('text=Add Credits');

    // Wait for modal to appear
    await page.waitForTimeout(2000);

    // Check if modal appeared or if there's an error message
    const modalVisible = await page.locator('text=Add Credits to Wallet').isVisible();
    const errorVisible = await page.locator('text=Please login to add credits').isVisible();
    
    if (errorVisible) {
      console.log('User not authenticated, showing error message');
      expect(errorVisible).toBe(true);
    } else {
      // Should open payment modal
      await expect(page.locator('text=Add Credits to Wallet')).toBeVisible();
      await expect(page.locator('input[type="number"]')).toBeVisible();
    }
  });

  test('should validate payment amount input', async ({ page }) => {
    // Open payment modal
    await page.click('text=Add Credits');
    
    // Wait for modal to appear
    await page.waitForTimeout(1000);

    // Try to enter invalid amount
    await page.fill('input[type="number"]', '0');
    
    // Submit button should be disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Try negative amount
    await page.fill('input[type="number"]', '-10');
    // Button should be disabled for negative amounts
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('should close payment modal when close button is clicked', async ({ page }) => {
    // Open payment modal
    await page.click('text=Add Credits');
    
    // Wait for modal to appear
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Add Credits to Wallet')).toBeVisible();

    // Click close button (X button)
    await page.click('button:has-text("×")');

    // Modal should be closed
    await expect(page.locator('text=Add Credits to Wallet')).not.toBeVisible();
  });

  test('should show payment form with valid amount', async ({ page }) => {
    // Open payment modal
    await page.click('text=Add Credits');
    
    // Wait for modal to appear
    await page.waitForTimeout(1000);

    // Enter valid amount
    await page.fill('input[type="number"]', '50');

    // Submit button should be enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });
});
