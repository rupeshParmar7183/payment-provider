import { Test } from '@nestjs/testing';

import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import { AppModule } from '../src/app.module';


describe('Auth APIs', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register user', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .post('/auth/register')
      .send({
        email:
          `test${Date.now()}@gmail.com`,
        password: 'password123',
      });

    expect(response.status).toBe(201);
  });

  it('should login user', async () => {
    const email =
      `login${Date.now()}@gmail.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
      });

    const response = await request(
      app.getHttpServer(),
    )
      .post('/auth/login')
      .send({
        email,
        password: 'password123',
      });

    expect(response.status).toBe(201);

    expect(
      response.body.accessToken,
    ).toBeDefined();
  });
});