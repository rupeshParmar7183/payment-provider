import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { Transaction } from '../models/transaction.model';
import { Card } from '../models/card.model';
import { TransactionStateHistory } from '../models/transaction-state-history.model';

import { CreatePaymentDto } from './dto/create-payment.dto';

import { TransactionStatus } from '../common/enums/transaction-status.enum';

import { BankService } from '../bank/bank.service';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel(Transaction)
        private transactionModel: typeof Transaction,

        @InjectModel(Card)
        private cardModel: typeof Card,

        @InjectModel(TransactionStateHistory)
        private historyModel: typeof TransactionStateHistory,

        private bankService: BankService,
    ) { }

    /**
     * Main payment orchestration flow
     */
    async createPayment(
        userId: string,
        createPaymentDto: CreatePaymentDto,
    ) {
        const {
            cardToken,
            amount,
            currency,
        } = createPaymentDto;

        // Validate card belongs to user
        await this.validateCardOwnership(
            userId,
            cardToken,
        );

        // Create initial transaction
        const transaction =
            await this.createTransaction(
                userId,
                cardToken,
                amount,
                currency,
            );

        // Process payment with retry logic
        return this.processPaymentWithRetry(
            transaction,
        );
    }

    /**
     * Validate user owns the card token
     */
    async validateCardOwnership(
        userId: string,
        cardToken: string,
    ) {
        const card = await this.cardModel.findOne({
            where: {
                userId,
                cardToken,
            },
        });

        if (!card) {
            throw new BadRequestException(
                'Card not found',
            );
        }
    }

    /**
     * Create initial transaction
     */
    async createTransaction(
        userId: string,
        cardToken: string,
        amount: number,
        currency: string,
    ) {
        const transaction =
            await this.transactionModel.create({
                userId,
                cardToken,
                amount,
                currency,
                status: TransactionStatus.INITIATED,
            });

        await this.addStateHistory(
            transaction.id,
            'NONE',
            TransactionStatus.INITIATED,
        );

        await this.updateTransactionStatus(
            transaction,
            TransactionStatus.PROCESSING,
            TransactionStatus.INITIATED,
        );

        return transaction;
    }

    /**
     * Main retry processing flow
     */
    async processPaymentWithRetry(
        transaction: Transaction,
    ) {
        let attempt = 0;

        let bankResponse;

        while (attempt < 3) {
            attempt++;

            bankResponse =
                await this.bankService.authorizePayment();

            // Success case
            if (bankResponse.success) {
                return this.handleSuccessfulPayment(
                    transaction,
                    bankResponse.authorizationCode!,
                );
            }

            // Check retry eligibility
            const isRetryable =
                this.isRetryableError(
                    bankResponse.errorCode!,
                );

            if (!isRetryable) {
                break;
            }

            // Handle retry state
            transaction.retryCount = attempt;

            await this.updateTransactionStatus(
                transaction,
                TransactionStatus.RETRYING,
                TransactionStatus.PROCESSING,
                bankResponse.errorCode,
            );

            // Exponential backoff
            const delay =
                Math.pow(2, attempt) * 1000;

            await this.sleep(delay);

            await this.updateTransactionStatus(
                transaction,
                TransactionStatus.PROCESSING,
                TransactionStatus.RETRYING,
            );
        }

        // Final failure after retries exhausted
        return this.handleFailedPayment(
            transaction,
            bankResponse!.errorCode!,
        );
    }

    /**
     * Handle successful payment
     */
    async handleSuccessfulPayment(
        transaction: Transaction,
        authorizationCode: string,
    ) {
        transaction.authorizationCode =
            authorizationCode;

        await this.updateTransactionStatus(
            transaction,
            TransactionStatus.AUTHORIZED,
            TransactionStatus.PROCESSING,
        );

        return {
            transactionId: transaction.id,
            status: transaction.status,
            authorizationCode,
        };
    }

    /**
     * Handle failed payment
     */
    async handleFailedPayment(
        transaction: Transaction,
        errorCode: string,
    ) {
        transaction.failureReason = errorCode;

        await this.updateTransactionStatus(
            transaction,
            TransactionStatus.FAILED,
            TransactionStatus.PROCESSING,
            errorCode,
        );

        return {
            transactionId: transaction.id,
            status: transaction.status,
            errorCode,
        };
    }

    /**
     * Update transaction status + save history
     */
    async updateTransactionStatus(
        transaction: Transaction,
        newStatus: TransactionStatus,
        previousStatus: string,
        reason?: string,
    ) {
        transaction.status = newStatus;

        await transaction.save();

        await this.addStateHistory(
            transaction.id,
            previousStatus,
            newStatus,
            reason,
        );
    }

    /**
     * Determine retry eligibility
     */
    isRetryableError(errorCode: string) {
        return [
            'NETWORK_TIMEOUT',
            'RATE_LIMIT_EXCEEDED',
        ].includes(errorCode);
    }

    /**
     * Exponential retry delay
     */
    async sleep(ms: number) {
        return new Promise((resolve) =>
            setTimeout(resolve, ms),
        );
    }

    /**
     * Save transaction state history
     */
    async addStateHistory(
        transactionId: string,
        fromState: string,
        toState: string,
        reason?: string,
    ) {
        await this.historyModel.create({
            transactionId,
            fromState,
            toState,
            reason,
        });
    }
}