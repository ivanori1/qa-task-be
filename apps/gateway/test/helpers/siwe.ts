import { Wallet } from 'ethers';
import { SiweMessage } from 'siwe';
import axios from 'axios';

export async function generateSiweLogin() {
  const privateKey = process.env.TEST_PRIVATE_KEY;
  const domain = process.env.TEST_DOMAIN || 'localhost'; // ← no port!
  const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
  const gateway = process.env.TEST_GATEWAY_URL || 'http://localhost:8080';

  if (!privateKey || !domain || !origin) {
    throw new Error('Missing TEST_PRIVATE_KEY, TEST_DOMAIN, or TEST_ORIGIN');
  }

  const wallet = new Wallet(privateKey);

  // ✅ Fetch nonce from backend
  const { data } = await axios.get(
    `${gateway}/v1/siwe/nonce/${wallet.address}`,
  );
  const nonce = data;

  const messageObj = new SiweMessage({
    domain,
    address: wallet.address,
    statement: 'Sign in with Ethereum to the app.',
    uri: origin,
    version: '1',
    chainId: 1,
    nonce,
    issuedAt: new Date().toISOString(),
  });

  const message = messageObj.prepareMessage();
  const signature = await wallet.signMessage(message);

  return {
    address: wallet.address,
    message,
    signature,
  };
}
