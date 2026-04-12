import { Types } from 'mongoose';
import { OfferStatus } from '../enums/offer-status.enum';

export class OfferFilterDto {
  _id?: Types.ObjectId | string;
  ownerId?: Types.ObjectId | string;
  status?: OfferStatus;
}
