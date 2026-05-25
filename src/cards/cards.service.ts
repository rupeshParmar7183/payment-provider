import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Card } from '../models/card.model';
import { AddCardDto } from './dto/add-card.dto';
import { isValidCardNumber } from '../common/utils/luhn.util';
import { detectCardBrand } from '../common/utils/card-brand.util';

@Injectable()
export class CardsService {
    constructor(
        @InjectModel(Card)
        private cardModel: typeof Card,
    ) { }

    async addCard(userId: string, addCardDto: AddCardDto) {
        const {
            cardNumber,
            expiryMonth,
            expiryYear,
        } = addCardDto;

        const isValid = isValidCardNumber(cardNumber);

        const currentDate = new Date();

        const currentMonth = currentDate.getMonth() + 1;

        const currentYear = currentDate.getFullYear();

        if (
            expiryYear < currentYear ||
            (expiryYear === currentYear &&
                expiryMonth < currentMonth)
        ) {
            throw new BadRequestException(
                'Card is expired',
            );
        }

        if (!isValid) {
            throw new BadRequestException(
                'Invalid card number',
            );
        }

        const last4 = cardNumber.slice(-4);

        const maskedCardNumber = `**** **** **** ${last4}`;

        const cardToken = uuidv4();

        const card = await this.cardModel.create({
            userId,
            cardToken,
            maskedCardNumber,
            expiryMonth,
            expiryYear,
            cardBrand: detectCardBrand(cardNumber),
        });

        return {
            message: 'Card added successfully',
            cardToken: card.cardToken,
        };
    }



    async getCards(userId: string) {
        const cards = await this.cardModel.findAll({
            where: {
                userId,
            },

            attributes: [
                'cardToken',
                'maskedCardNumber',
                'expiryMonth',
                'expiryYear',
                'cardBrand',
            ],
        });

        return cards;
    }
}