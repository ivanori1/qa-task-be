import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Wallet } from 'ethers';
import { SiweMessage } from 'siwe';
import { AppModule } from '../src/app.module';

describe('Signup (e2e)', () => {
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

  it('POST /v1/user/signup should return JWT token with valid SIWE', async () => {
    const privateKey = process.env.TEST_PRIVATE_KEY;
    const domain = process.env.TEST_DOMAIN || 'localhost';
    const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';

    if (!privateKey || !domain || !origin) {
      throw new Error('Missing TEST_PRIVATE_KEY, TEST_DOMAIN or TEST_ORIGIN');
    }

    const wallet = new Wallet(privateKey);
    const address = wallet.address;

    // ✅ Get nonce using supertest (preserves session)
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
    const signature = await wallet.signMessage(message);

    const unique = Date.now();

    const res = await request(app.getHttpServer())
      .post('/user/signup')
      .send({
        message,
        signature,
        userName: `user-${unique}`,
        email: `user-${unique}@test.com`,
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);

    console.log('📦 Token:', res.body.token);
    expect(res.body).toHaveProperty('token');
  });
});
