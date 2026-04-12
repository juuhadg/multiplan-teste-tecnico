import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinDate,
} from 'class-validator';
import { OfferStatus } from '../enums/offer-status.enum';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @MinDate(() => new Date())
  expiresAt?: Date;

  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
