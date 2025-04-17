import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Wallet } from 'ethers';
import { SiweMessage } from 'siwe';
import { AppModule } from '../src/app.module';

describe('Login (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/user/login should return JWT token for known user', async () => {
    const privateKey = process.env.TEST_PRIVATE_KEY;
    const domain = process.env.TEST_DOMAIN || 'localhost';
    const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';

    if (!privateKey) {
      throw new Error('Missing TEST_PRIVATE_KEY in environment');
    }

    const wallet = new Wallet(privateKey);
    const address = wallet.address;

    // Step 1: Get nonce
    const nonceRes = await request(app.getHttpServer())
      .get(`/siwe/nonce/${address}`)
      .expect(200);

    const nonce = nonceRes.text;

    // Step 2: Create and sign SIWE message
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
    const signature = await wallet.signMessage(message);

    // Step 3: Login request
    const res = await request(app.getHttpServer())
      .post('/user/login')
      .send({
        message,
        signature,
      })
      .expect(201);

    console.log('✅ Login Token:', res.body.token);
    console.log('🧪 Wallet address:', address);

    expect(res.body).toHaveProperty('token');
  });
});
