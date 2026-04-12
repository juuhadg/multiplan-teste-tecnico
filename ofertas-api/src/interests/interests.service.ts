import { ConflictException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { OfferStatus } from '../offers/enums/offer-status.enum';
import { OffersRepository } from '../offers/offers.repository';
import { InterestsRepository } from './interests.repository';

@Injectable()
export class InterestsService {
  constructor(
    private readonly interestsRepository: InterestsRepository,
    private readonly offersRepository: OffersRepository,
  ) {}

  async register(offerId: string, buyerId: string) {
    const offerObjectId = new Types.ObjectId(offerId);
    const buyerObjectId = new Types.ObjectId(buyerId);

    const existing = await this.interestsRepository.findOne({
      offerId: offerObjectId,
      buyerId: buyerObjectId,
    });
    if (existing) {
      throw new ConflictException('You already expressed interest in this offer');
    }

    const updatedOffer = await this.offersRepository.decrementStock(offerId);
    if (!updatedOffer) {
      throw new ConflictException('Offer unavailable');
    }

    if (updatedOffer.stock === 0) {
      await this.offersRepository.updateOne(
        { _id: offerId },
        { $set: { status: OfferStatus.SOLD_OUT } },
      );
    }

    return this.interestsRepository.create({
      offerId: offerObjectId,
      buyerId: buyerObjectId,
    });
  }
}
