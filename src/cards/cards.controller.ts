import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { CardsService } from './cards.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AddCardDto } from './dto/add-card.dto';

@Controller('cards')
export class CardsController {
    constructor(
        private readonly cardsService: CardsService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    addCard(
        @Req() req: any,
        @Body() addCardDto: AddCardDto,
    ) {
        return this.cardsService.addCard(
            req.user.userId,
            addCardDto,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getCards(@Req() req: any) {
        return this.cardsService.getCards(
            req.user.userId,
        );
    }
}