import { Test } from '@nestjs/testing';

import {
  INestApplication,
} from '@nestjs/common';

import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Payments APIs', () => {
  let app: INestApplication;

  let token: string;

  let cardToken: string;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app =
      moduleRef.createNestApplication();

    await app.init();

    // Register user
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

    // Login
    const loginResponse =
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password,
        });

    token =
      loginResponse.body.accessToken;

    // Add card
    const addCardResponse =
      await request(app.getHttpServer())
        .post('/cards')
        .set(
          'Authorization',
          `Bearer ${token}`,
        )
        .send({
          cardNumber:
            '4111111111111111',

          expiryMonth: 12,

          expiryYear: 2028,
        });

    cardToken =
      addCardResponse.body.cardToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it(
    'should prevent duplicate payment',
    async () => {
      const key =
        `payment-${Date.now()}`;

      const firstRequest =
        await request(
          app.getHttpServer(),
        )
          .post('/payments')
          .set(
            'Authorization',
            `Bearer ${token}`,
          )
          .set(
            'Idempotency-Key',
            key,
          )
          .send({
            cardToken,
            amount: 100,
            currency: 'USD',
          });

      expect(
        firstRequest.status,
      ).toBe(201);

      const secondRequest =
        await request(
          app.getHttpServer(),
        )
          .post('/payments')
          .set(
            'Authorization',
            `Bearer ${token}`,
          )
          .set(
            'Idempotency-Key',
            key,
          )
          .send({
            cardToken,
            amount: 100,
            currency: 'USD',
          });

      expect(
        secondRequest.body.message,
      ).toBe(
        'Duplicate request detected',
      );
    },
  );
});