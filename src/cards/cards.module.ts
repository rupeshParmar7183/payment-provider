import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

import { Card } from '../models/card.model';

@Module({
  imports: [SequelizeModule.forFeature([Card])],

  controllers: [CardsController],

  providers: [CardsService],
})
export class CardsModule {}