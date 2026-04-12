import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  MinDate,
} from 'class-validator';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  discount: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsDate()
  @Type(() => Date)
  @MinDate(() => new Date())
  expiresAt: Date;
}
