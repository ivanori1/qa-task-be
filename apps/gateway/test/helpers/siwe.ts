import { Wallet } from 'ethers';
import { SiweMessage } from 'siwe';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

interface GenerateSiweLoginOptions {
  app: INestApplication;
  wallet?: Wallet; // optional override (for login tests)
}

/**
 * Generates a valid SIWE message, signature, and address.
 * Can use a custom wallet or generate a fresh one for signup flows.
 */
export async function generateSiweLogin({
  app,
  wallet,
}: GenerateSiweLoginOptions) {
  const domain = process.env.TEST_DOMAIN || 'localhost';
  const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';

  const resolvedWallet = wallet ?? Wallet.createRandom(); // 🧠 fallback to random for signup
  const address = resolvedWallet.address;

  // Get nonce from the backend (preserving session)
  const nonceRes = await request(app.getHttpServer())
    .get(`/siwe/nonce/${address}`)
    .expect(200);

  const nonce = nonceRes.text;

  const siweMessage = new SiweMessage({
    domain,
    address,
    statement: 'Sign in with Ethereum to the app.',
    uri: origin,
    version: '1',
    chainId: 1,
    nonce,
    issuedAt: new Date().toISOString(),
  });

  const message = siweMessage.prepareMessage();
  const signature = await resolvedWallet.signMessage(message);

  return {
    wallet: resolvedWallet,
    address,
    message,
    signature,
  };
}
