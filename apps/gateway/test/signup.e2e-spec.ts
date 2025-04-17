import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { generateSiweLogin } from '../test/helpers/siwe';

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

  it('POST /v1/user/signup should return JWT token with fresh random wallet', async () => {
    const { wallet, message, signature, address } = await generateSiweLogin({
      app,
    });

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

    console.log('✅ Token:', res.body.token);
    console.log('🧪 Wallet address:', address);

    expect(res.body).toHaveProperty('token');
  });
});
