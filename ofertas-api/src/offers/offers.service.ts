import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { InterestsRepository } from '../interests/interests.repository';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferStatus } from './enums/offer-status.enum';
import { OfferFilterDto } from './dto/offer-filter.dto';
import { OffersGateway } from './offers.gateway';
import { OffersRepository } from './offers.repository';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type OffersListSort = 'recent' | 'expiresSoon';

@Injectable()
export class OffersService {
  constructor(
    private readonly offersRepository: OffersRepository,
    private readonly offersGateway: OffersGateway,
    @Inject(forwardRef(() => InterestsRepository))
    private readonly interestsRepository: InterestsRepository,
  ) {}

  async findAll(
    page: number,
    limit: number,
    status?: OfferStatus,
    ownerId?: string,
    q?: string,
    sort: OffersListSort = 'recent',
    viewerId?: string,
  ) {
    const filter: OfferFilterDto = {};
    if (status) filter.status = status;
    if (ownerId) filter.ownerId = new Types.ObjectId(ownerId);
    const trimmed = q?.trim();
    if (trimmed) {
      const pattern = new RegExp(escapeRegex(trimmed), 'i');
      filter.$or = [{ title: pattern }, { description: pattern }];
    }
    const sortSpec: Record<string, 1 | -1> =
      sort === 'expiresSoon' ? { expiresAt: 1 } : { createdAt: -1 };
    const offers = await this.offersRepository.find(
      filter,
      page,
      limit,
      sortSpec,
    );
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

    if (viewerId && items.length > 0) {
      const buyerOid = new Types.ObjectId(viewerId);
      const offerOids = items.map(
        (item) => new Types.ObjectId(String(item._id)),
      );
      const interestedOfferIds =
        await this.interestsRepository.findOfferIdsByBuyer(
          buyerOid,
          offerOids,
        );
      const interested = new Set(
        interestedOfferIds.map((id) => id.toString()),
      );
      return {
        items: items.map((item) => ({
          ...item,
          hasMyInterest: interested.has(String(item._id)),
        })),
        hasNext,
        page,
        limit,
      };
    }

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
