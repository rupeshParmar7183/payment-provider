import {
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  cardToken!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsNotEmpty()
  currency!: string;
}