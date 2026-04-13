import { Types } from 'mongoose';
import { OfferStatus } from '../enums/offer-status.enum';

export type OfferTextSearchOrClause =
  | { title: RegExp }
  | { description: RegExp };

export class OfferFilterDto {
  _id?: Types.ObjectId | string;
  ownerId?: Types.ObjectId | string;
  status?: OfferStatus;
  $or?: OfferTextSearchOrClause[];
}
