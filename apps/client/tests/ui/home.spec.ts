import { test, expect } from '@playwright/test';

test('Homepage loads and displays core UI elements', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect the "Xborg" link in header
  await expect(page.getByRole('link', { name: 'Xborg' })).toBeVisible();

  // Expect welcome heading
  await expect(
    page.getByRole('heading', { name: 'Welcome to XBorg' })
  ).toBeVisible();

  // Login button
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

  // Sign up button
  await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible();
});
