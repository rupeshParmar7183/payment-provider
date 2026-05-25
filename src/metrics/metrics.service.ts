import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { Transaction } from '../models/transaction.model';

import { TransactionStatus } from '../common/enums/transaction-status.enum';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(Transaction)
    private transactionModel: typeof Transaction,
  ) {}

  async getMetrics() {
    // Fetch all transactions
    const transactions =
      await this.transactionModel.findAll();

    const totalTransactions =
      transactions.length;

    // Successful transactions
    const successfulTransactions =
      transactions.filter(
        (transaction) =>
          transaction.status ===
          TransactionStatus.AUTHORIZED,
      ).length;

    // Failed transactions
    const failedTransactions =
      transactions.filter(
        (transaction) =>
          transaction.status ===
          TransactionStatus.FAILED,
      ).length;

    // Transactions with retries
    const transactionsWithRetry =
      transactions.filter(
        (transaction) =>
          transaction.retryCount > 0,
      ).length;

    // Total retry attempts
    const totalRetryAttempts =
      transactions.reduce(
        (sum, transaction) =>
          sum +
          (transaction.retryCount || 0),
        0,
      );

    // Success rate
    const successRate =
      totalTransactions === 0
        ? 0
        : (
            (successfulTransactions /
              totalTransactions) *
            100
          ).toFixed(2);

    // Failure rate
    const failureRate =
      totalTransactions === 0
        ? 0
        : (
            (failedTransactions /
              totalTransactions) *
            100
          ).toFixed(2);

    // Average processing time
    const totalProcessingTime =
      transactions.reduce(
        (sum, transaction) => {
          const createdAt =
            new Date(
              transaction.createdAt,
            ).getTime();

          const updatedAt =
            new Date(
              transaction.updatedAt,
            ).getTime();

          return (
            sum +
            (updatedAt - createdAt)
          );
        },
        0,
      );

    const averageProcessingTimeMs =
      totalTransactions === 0
        ? 0
        : Math.round(
            totalProcessingTime /
              totalTransactions,
          );

    // Status distribution
    const statusDistribution = {
      AUTHORIZED:
        successfulTransactions,

      FAILED: failedTransactions,

      PROCESSING: transactions.filter(
        (transaction) =>
          transaction.status ===
          TransactionStatus.PROCESSING,
      ).length,

      RETRYING: transactions.filter(
        (transaction) =>
          transaction.status ===
          TransactionStatus.RETRYING,
      ).length,
    };

    return {
      generatedAt: new Date(),  
      overview: {
        totalTransactions,
        successfulTransactions,
        failedTransactions,

        successRate:
          `${successRate}%`,

        failureRate:
          `${failureRate}%`,
      },

      retries: {
        transactionsWithRetry,
        totalRetryAttempts,
      },

      performance: {
        averageProcessingTimeMs,
      },

      statusDistribution,
    };
  }
}