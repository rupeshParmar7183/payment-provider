import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

import { Transaction } from '../models/transaction.model';
import { Card } from '../models/card.model';
import { TransactionStateHistory } from '../models/transaction-state-history.model';

import { BankModule } from '../bank/bank.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Transaction,
      Card,
      TransactionStateHistory,
    ]),

    BankModule,
  ],

  controllers: [PaymentsController],

  providers: [PaymentsService],
})
export class PaymentsModule {}