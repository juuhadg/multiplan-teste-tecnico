import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types, UpdateQuery } from 'mongoose';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferFilterDto } from './dto/offer-filter.dto';
import { OfferStatus } from './enums/offer-status.enum';
import { Offer } from './schemas/offer.schema';

export type CreateOfferData = CreateOfferDto & { ownerId: Types.ObjectId };

@Injectable()
export class OffersRepository {
  constructor(
    @InjectModel(Offer.name) private readonly offerModel: Model<Offer>,
  ) {}

  findOne(filter: OfferFilterDto): Promise<HydratedDocument<Offer> | null> {
    return this.offerModel.findOne(filter).exec();
  }

  find(
    filter: OfferFilterDto,
    page = 1,
    limit = 10,
  ): Promise<HydratedDocument<Offer>[]> {
    return this.offerModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit + 1)
      .populate('ownerId', 'name')
      .exec();
  }

  create(data: CreateOfferData): Promise<HydratedDocument<Offer>> {
    return this.offerModel.create(data);
  }

  decrementStock(
    offerId: string,
  ): Promise<HydratedDocument<Offer> | null> {
    return this.offerModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(offerId),
          status: OfferStatus.ACTIVE,
          stock: { $gt: 0 },
        },
        { $inc: { stock: -1, interestCount: 1 } },
        { new: true },
      )
      .exec();
  }

  updateOne(
    filter: OfferFilterDto,
    update: UpdateQuery<Offer>,
  ): Promise<HydratedDocument<Offer> | null> {
    return this.offerModel
      .findOneAndUpdate(filter, update, { new: true })
      .exec();
  }

  expireOffers(): Promise<unknown> {
    return this.offerModel
      .updateMany(
        { status: OfferStatus.ACTIVE, expiresAt: { $lte: new Date() } },
        { $set: { status: OfferStatus.EXPIRED } },
      )
      .exec();
  }
}
