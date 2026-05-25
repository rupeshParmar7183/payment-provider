import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { PaymentsModule } from './payments/payments.module';
import { BankModule } from './bank/bank.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './models/user.model';
import { Card } from './models/card.model';
import { Transaction } from './models/transaction.model';
import { TransactionStateHistory } from './models/transaction-state-history.model';
import { IdempotencyKey } from './models/idempotency-key.model';
import { MetricsModule } from './metrics/metrics.module';
import {
  ThrottlerModule,
  ThrottlerGuard,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadModels: true,
      synchronize: true,
      logging: false,
      models: [User, Card, Transaction, TransactionStateHistory, IdempotencyKey],
    }),

    AuthModule,

    CardsModule,

    PaymentsModule,

    BankModule,

    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },],



})
export class AppModule { }