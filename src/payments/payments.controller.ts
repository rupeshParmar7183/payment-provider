import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
    Headers,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { PaymentsService } from './payments.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { IdempotencyGuard } from './guards/idempotency.guard';
@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
    ) { }

    @UseGuards(JwtAuthGuard, IdempotencyGuard)
    @Post()
    createPayment(
        @Req() req: any,
        @Headers('idempotency-key') idempotencyKey: string,
        @Body() createPaymentDto: CreatePaymentDto,
    ) {

        if (req.idempotentTransaction) {
            return {
                message:
                    'Duplicate request detected',
                transactionId:
                    req.idempotentTransaction.id,
                status:
                    req.idempotentTransaction.status,
            };
        }
        return this.paymentsService.createPayment(
            req.user.userId,

            createPaymentDto,
            idempotencyKey
        );
    }
}