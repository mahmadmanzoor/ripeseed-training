import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');

    // Fill in registration form
    await page.fill('input[name="email"]', 'e2e-test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to homepage
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome to Mini Store!')).toBeVisible();
    await expect(page.locator('text=Your Wallet Balance: $1000.00')).toBeVisible();
  });

  test('should login with existing user', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form
    await page.fill('input[name="email"]', 'e2e-test@example.com');
    await page.fill('input[name="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to homepage
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome to Mini Store!')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'e2e-test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should be on homepage
    await expect(page).toHaveURL('/');

    // Click logout
    await page.click('text=Logout');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });
});
