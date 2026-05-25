import { Test } from '@nestjs/testing';

import {
  INestApplication,
} from '@nestjs/common';

import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Cards APIs', () => {
  let app: INestApplication;

  let token: string;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app =
      moduleRef.createNestApplication();

    await app.init();

    // Create test user
    const email =
      `test${Date.now()}@gmail.com`;

    const password =
      'password123';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password,
      });

    // Login user
    const loginResponse =
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password,
        });

    token =
      loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject invalid card', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .post('/cards')
      .set(
        'Authorization',
        `Bearer ${token}`,
      )
      .send({
        cardNumber:
          '1234567890123456',

        expiryMonth: 12,

        expiryYear: 2028,
      });

    expect(response.status).toBe(400);
  });
});