import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Interest {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Offer' })
  offerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  buyerId: Types.ObjectId;
}

export const InterestSchema = SchemaFactory.createForClass(Interest);

InterestSchema.index({ offerId: 1, buyerId: 1 }, { unique: true });
InterestSchema.index({ buyerId: 1, offerId: 1 });
