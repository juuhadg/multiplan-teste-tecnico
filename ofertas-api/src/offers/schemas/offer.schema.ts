import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { OfferStatus } from '../enums/offer-status.enum';

@Schema({ timestamps: true })
export class Offer {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, min: 0, max: 100 })
  discount: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true, type: String, enum: OfferStatus, default: OfferStatus.ACTIVE })
  status: OfferStatus;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({ required: true, default: 0, min: 0 })
  interestCount: number;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
