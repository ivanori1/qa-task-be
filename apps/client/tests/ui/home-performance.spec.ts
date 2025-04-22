import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const reportDir = path.resolve(__dirname, '../../../playwright-report');
const outputFile = path.join(reportDir, 'performance.json');

test.describe('Page Load Performance', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
  });

  test('Measure load times for Home, Login, and Signup pages', async ({ page }) => {
    const metrics: any[] = [];

    // Measure home page
    const homeStart = performance.now();
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('domcontentloaded');
    const homeEnd = performance.now();
    metrics.push({
      label: 'Home page',
      loadTimeMs: Math.round(homeEnd - homeStart),
      measuredAt: new Date().toISOString(),
    });
    console.log(metrics)

    // Measure Login page
    const loginStart = performance.now();
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForSelector('h5:text("Login to")');
    const loginEnd = performance.now();
    metrics.push({
      label: 'Login page',
      loadTimeMs: Math.round(loginEnd - loginStart),
      measuredAt: new Date().toISOString(),
    });
    console.log(metrics)

    // Navigate back to home
    await page.goto('http://localhost:3000/');

    // Measure Signup page
    const signupStart = performance.now();
    await page.getByRole('button', { name: 'Sign up' }).click();
    await page.waitForSelector('h5:text("Sign up to")');
    const signupEnd = performance.now();
    metrics.push({
      label: 'Signup page',
      loadTimeMs: Math.round(signupEnd - signupStart),
      measuredAt: new Date().toISOString(),
    });
    console.log(metrics)

    // Write results
    fs.writeFileSync(outputFile, JSON.stringify(metrics, null, 2));
    console.log(`Performance metrics written to ${outputFile}`);
  });
});
