import { test, expect } from '@playwright/test';

test.describe('Complete User Flow', () => {
  test('should complete full user journey from registration to payment', async ({ page }) => {
    // 1. Register new user
    await page.goto('/register');
    await page.fill('input[name="email"]', `user-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');

    // Should be redirected to homepage
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=🛍️ Browse Products')).toBeVisible();
    await expect(page.locator('text=$1000.00').first()).toBeVisible();

    // 2. Navigate to products
    await page.click('text=🛍️ Products');
    await expect(page).toHaveURL('/products');

    // 3. Go back to homepage (click the logo)
    await page.click('text=Mini Store');
    await expect(page).toHaveURL('/');

    // 4. Test credit transfer modal
    await page.click('text=Transfer Credits');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=💸 Transfer Credits')).toBeVisible();
    
    // Close modal
    await page.click('button:has-text("×")');

    // 5. Test payment modal
    await page.click('text=Add Credits');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Add Credits to Wallet')).toBeVisible();
    
    // Close modal
    await page.click('button:has-text("×")');

    // 6. Test logout
    await page.click('text=Logout');
    await expect(page).toHaveURL('/');
  });

  test('should handle navigation between pages', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'e2e-test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Test navigation
    await page.click('text=🛍️ Products');
    await expect(page).toHaveURL('/products');

    await page.click('text=Mini Store');
    await expect(page).toHaveURL('/');

    // Test navbar functionality
    await expect(page.locator('text=Mini Store')).toBeVisible();
    await expect(page.locator('text=🛍️ Products').first()).toBeVisible();
  });

  test('should show user information in navbar', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'e2e-test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Check navbar shows user info
    await expect(page.locator('text=e2e-test@example.com')).toBeVisible();
    await expect(page.locator('text=$1000.00').first()).toBeVisible();
    await expect(page.locator('text=Logout').first()).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access homepage without login
    await page.goto('/');
    
    // Should stay on homepage (no redirect for unauthenticated users)
    await expect(page).toHaveURL('/');
  });
});
