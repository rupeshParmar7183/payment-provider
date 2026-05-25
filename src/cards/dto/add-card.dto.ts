import {
  IsNotEmpty,
  IsNumber,
  Length,
  Max,
  Min,
} from 'class-validator';

export class AddCardDto {
  @IsNotEmpty()
  @Length(16, 16)
  cardNumber!: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  expiryMonth!: number;

  @IsNumber()
  @Min(new Date().getFullYear())
  expiryYear!: number;
}