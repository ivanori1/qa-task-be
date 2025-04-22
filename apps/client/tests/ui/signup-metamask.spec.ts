import { test, expect } from '@playwright/test';
import { launch, MetaMaskWallet } from '@tenkeylabs/dappwright';
import { Wallet } from 'ethers';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test.local' });

test('Signup on XBorg with a new MetaMask wallet', async () => {
  // 1. Generate new wallet
  const newWallet = Wallet.createRandom();
  const privateKey = newWallet.privateKey;

  // 2. Launch MetaMask browser context
  const { wallet, browserContext } = await launch('chromium', {
    wallet: 'metamask',
    version: '12.16.0',
    headless: false,
    slowMo: 100,
    args: ['--window-size=1280,900'],
  });

  const metamask = wallet as MetaMaskWallet;
  const mmPage = await metamask.page;

  // 3. Setup MetaMask with new private key
  if (!process.env.METAMASK_PASSWORD) {
    throw new Error('❌ METAMASK_PASSWORD is missing in .env.local');
  }

  await metamask.setup({ password: process.env.METAMASK_PASSWORD });
  await metamask.importPK(privateKey);

  console.log(`🆕 Imported new wallet: ${newWallet.address}`);

  // 4. Open dapp and fill signup fields
  const dappPage = await browserContext.newPage();
  await dappPage.goto('http://localhost:3000/');
  await dappPage.getByRole('button', { name: 'Sign up' }).click();

  // Store typed input values for later verification
const username = `user${Math.floor(Math.random() * 10000)}`;
const firstName = 'Quality';
const lastName = 'Assurance';
const email = `testuser${Date.now()}@mail.com`;

// Fill in the form with saved values
await dappPage.getByLabel('Username').fill(username);
await dappPage.getByLabel('First name').fill(firstName);
await dappPage.getByLabel('Last name').fill(lastName);
await dappPage.getByLabel('Email').fill(email);


  // 5. Trigger MetaMask connect flow
  await expect(dappPage.getByText('Sign up with Metamask')).toBeVisible();
  await dappPage.getByText('Sign up with Metamask').click();

  // 6. Approve connection from MetaMask
  await mmPage.reload();
  await mmPage.waitForSelector('[data-testid="confirm-btn"]', { timeout: 10000 });
  await mmPage.click('[data-testid="confirm-btn"]');

  // 7. Confirm signature
  await mmPage.waitForSelector('h2:text("Sign-in request")', { timeout: 10000 });
  await mmPage.click('[data-testid="confirm-footer-button"]');

  // 8. Bring Dapp tab to front and verify UI
  await dappPage.bringToFront();
  await expect(dappPage.getByRole('heading', { name: 'Profile' })).toBeVisible({ timeout: 10000 });

  
// 9. Verify typed values match displayed profile info
await expect(dappPage.getByText(username)).toBeVisible();
await expect(dappPage.getByText(firstName)).toBeVisible();
await expect(dappPage.getByText(lastName)).toBeVisible();
await expect(dappPage.getByText(email)).toBeVisible();
await expect(dappPage.getByText('Not set')).toBeVisible(); 

  console.log('✅ Signup with new wallet completed successfully');
});
