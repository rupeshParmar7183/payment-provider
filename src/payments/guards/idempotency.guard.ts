import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { IdempotencyKey } from '../../models/idempotency-key.model';
import { Transaction } from '../../models/transaction.model';

@Injectable()
export class IdempotencyGuard
  implements CanActivate
{
  constructor(
    @InjectModel(IdempotencyKey)
    private idempotencyModel: typeof IdempotencyKey,

    @InjectModel(Transaction)
    private transactionModel: typeof Transaction,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ) {
    const request =
      context.switchToHttp().getRequest();

    const idempotencyKey =
      request.headers['idempotency-key'];

    if (!idempotencyKey) {
      throw new BadRequestException(
        'Idempotency-Key header is required',
      );
    }

    const existingIdempotency =
      await this.idempotencyModel.findOne({
        where: {
          idempotencyKey,
        },
      });

    if (existingIdempotency) {
      const existingTransaction =
        await this.transactionModel.findByPk(
          existingIdempotency.transactionId,
        );

      request.idempotentTransaction =
        existingTransaction;
    }

    return true;
  }
}