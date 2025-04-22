import { test, expect } from '@playwright/test';
import { launch, MetaMaskWallet } from '@tenkeylabs/dappwright';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test.local' });

test('Login to XBorg via MetaMask', async () => {
  const { wallet, browserContext } = await launch('chromium', {
    wallet: 'metamask',
    version: '12.16.0',
    headless: false,
    args: ['--window-size=1280,900'],
    slowMo: 100,
  });

  const metamask = wallet as MetaMaskWallet;
  const mmPage = await metamask.page;

  // Set up wallet
  if (!process.env.METAMASK_SEED) {
    throw new Error('❌ METAMASK_SEED is missing in .env.local');
  }
  await metamask.setup({ seed: process.env.METAMASK_SEED });

  console.log('✅ MetaMask wallet set up');

  // Approve connection from MetaMask
  //await metamask.approve();

  // Sign the login message
  //await metamask.sign();

  // WORKAROUND
  // Open dapp in new tab (keeps MetaMask in focus)
  const dappPage = await browserContext.newPage();
  await dappPage.goto('http://localhost:3000/');
  await dappPage.getByRole('button', { name: 'Login' }).click();

  // MetaMask will show connect modal
  await mmPage.bringToFront();
  // Click "Login with Metamask"
  await expect(dappPage.getByText('Login with Metamask')).toBeVisible();
  await dappPage.getByText('Login with Metamask').click();

  await mmPage.reload();
  await mmPage.waitForSelector('[data-testid="confirm-btn"]', {
    timeout: 10000,
  });
  await mmPage.click('[data-testid="confirm-btn"]');

  // Wait and expect Sign-in request UI
  await mmPage.waitForSelector('h2:text("Sign-in request")', {
    timeout: 10000,
  });
  await mmPage.click('[data-testid="confirm-footer-button"]');

  // Switch focus back to dapp and validate Profile UI
  await dappPage.bringToFront();

  await expect(dappPage.getByRole('button', { name: 'Profile' })).toBeVisible({
    timeout: 10000,
  });

  await expect(
    dappPage.getByRole('heading', { name: 'Profile' })
  ).toBeVisible();

  console.log('✅ XBorg MetaMask login successful');
});
