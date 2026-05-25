import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

import { Transaction } from '../models/transaction.model';
import { Card } from '../models/card.model';
import { TransactionStateHistory } from '../models/transaction-state-history.model';
import { IdempotencyKey } from '../models/idempotency-key.model';
import { BankModule } from '../bank/bank.module';
import { IdempotencyGuard } from './guards/idempotency.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Transaction,
      Card,
      TransactionStateHistory,
      IdempotencyKey,
  
    ]),

    BankModule,
  ],

  controllers: [PaymentsController],

  providers: [PaymentsService,IdempotencyGuard],
})
export class PaymentsModule {}