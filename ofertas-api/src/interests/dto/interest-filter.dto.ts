import { Types } from 'mongoose';

export class InterestFilterDto {
  _id?: Types.ObjectId | string;
  offerId?: Types.ObjectId | string;
  buyerId?: Types.ObjectId | string;
}
