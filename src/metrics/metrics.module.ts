import { Module } from '@nestjs/common';

import { SequelizeModule } from '@nestjs/sequelize';

import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

import { Transaction } from '../models/transaction.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Transaction,
    ]),
  ],

  controllers: [MetricsController],

  providers: [MetricsService],
})
export class MetricsModule {}