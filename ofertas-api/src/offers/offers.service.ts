import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferStatus } from './enums/offer-status.enum';
import { OffersGateway } from './offers.gateway';
import { OffersRepository } from './offers.repository';

@Injectable()
export class OffersService {
  constructor(
    private readonly offersRepository: OffersRepository,
    private readonly offersGateway: OffersGateway,
  ) {}

  async findAll(
    page: number,
    limit: number,
    status?: OfferStatus,
    ownerId?: string,
  ) {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (ownerId) filter.ownerId = new Types.ObjectId(ownerId);
    const offers = await this.offersRepository.find(filter, page, limit);
    const hasNext = offers.length > limit;
    const sliced = hasNext ? offers.slice(0, limit) : offers;
    const items = sliced.map((doc) => {
      const obj = doc.toObject();
      const owner = obj.ownerId as unknown as
        | { _id: Types.ObjectId; name: string }
        | Types.ObjectId;
      const isPopulated =
        owner !== null && typeof owner === 'object' && 'name' in owner;
      return {
        ...obj,
        ownerId: isPopulated ? owner._id.toString() : owner.toString(),
        ownerName: isPopulated ? owner.name : undefined,
      };
    });
    return { items, hasNext, page, limit };
  }

  async create(dto: CreateOfferDto, ownerId: string) {
    const offer = await this.offersRepository.create({
      ...dto,
      ownerId: new Types.ObjectId(ownerId),
    });
    this.offersGateway.notifyNewOffer(offer);
    return offer;
  }

  async update(id: string, dto: UpdateOfferDto, ownerId: string) {
    const current = await this.assertOwnership(id, ownerId);

    const update: Record<string, unknown> = { ...dto };

    if (dto.status === undefined) {
      const nextExpiresAt = dto.expiresAt ?? current.expiresAt;
      const nextStock = dto.stock ?? current.stock;
      if (
        current.status !== OfferStatus.ACTIVE &&
        nextStock > 0 &&
        new Date(nextExpiresAt).getTime() > Date.now()
      ) {
        update.status = OfferStatus.ACTIVE;
      }
    }

    return this.offersRepository.updateOne({ _id: id }, { $set: update });
  }

  async close(id: string, ownerId: string) {
    await this.assertOwnership(id, ownerId);
    return this.offersRepository.updateOne(
      { _id: id },
      { $set: { status: OfferStatus.INACTIVE } },
    );
  }

  private async assertOwnership(id: string, ownerId: string) {
    const offer = await this.offersRepository.findOne({ _id: id });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    if (offer.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('You can only manage your own offers');
    }
    return offer;
  }
}
