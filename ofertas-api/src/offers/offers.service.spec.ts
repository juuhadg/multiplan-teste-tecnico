import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { OfferStatus } from './enums/offer-status.enum';
import { OffersGateway } from './offers.gateway';
import { OffersRepository } from './offers.repository';
import { OffersService } from './offers.service';

describe('OffersService', () => {
  let service: OffersService;
  let repository: jest.Mocked<OffersRepository>;
  let gateway: jest.Mocked<OffersGateway>;

  const ownerId = new Types.ObjectId().toString();
  const offerId = new Types.ObjectId().toString();

  const mockOffer = {
    _id: new Types.ObjectId(offerId),
    title: 'Offer',
    description: 'Desc',
    discount: 10,
    stock: 5,
    expiresAt: new Date('2030-01-01'),
    status: OfferStatus.ACTIVE,
    ownerId: new Types.ObjectId(ownerId),
  } as any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OffersService,
        {
          provide: OffersRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            updateOne: jest.fn(),
          },
        },
        {
          provide: OffersGateway,
          useValue: {
            notifyNewOffer: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(OffersService);
    repository = module.get(OffersRepository);
    gateway = module.get(OffersGateway);
  });

  describe('findAll', () => {
    it('should pass filters to repository', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll(1, 10, OfferStatus.ACTIVE, ownerId);

      const filter = repository.find.mock.calls[0][0] as any;
      expect(filter.status).toBe(OfferStatus.ACTIVE);
      expect(filter.ownerId).toBeInstanceOf(Types.ObjectId);
    });

    it('should pass empty filter when no params', async () => {
      repository.find.mockResolvedValue([]);

      await service.findAll(1, 10);

      expect(repository.find).toHaveBeenCalledWith({}, 1, 10);
    });
  });

  describe('create', () => {
    const dto = {
      title: 'Offer',
      description: 'Desc',
      discount: 10,
      stock: 5,
      expiresAt: new Date('2030-01-01'),
    };

    it('should create offer and notify via gateway', async () => {
      repository.create.mockResolvedValue(mockOffer);

      const result = await service.create(dto, ownerId);

      expect(repository.create).toHaveBeenCalled();
      expect(gateway.notifyNewOffer).toHaveBeenCalledWith(mockOffer);
      expect(result).toBe(mockOffer);
    });
  });

  describe('update', () => {
    it('should update when owner matches', async () => {
      repository.findOne.mockResolvedValue(mockOffer);
      repository.updateOne.mockResolvedValue(mockOffer);

      await service.update(offerId, { title: 'New' }, ownerId);

      expect(repository.updateOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if offer not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update(offerId, { title: 'New' }, ownerId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      repository.findOne.mockResolvedValue(mockOffer);
      const otherId = new Types.ObjectId().toString();

      await expect(
        service.update(offerId, { title: 'New' }, otherId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reactivate expired offer when new expiresAt is in the future', async () => {
      const expired = {
        ...mockOffer,
        status: OfferStatus.EXPIRED,
        stock: 3,
      };
      repository.findOne.mockResolvedValue(expired);
      repository.updateOne.mockResolvedValue(expired);

      const future = new Date(Date.now() + 86_400_000);
      await service.update(offerId, { expiresAt: future }, ownerId);

      const update = repository.updateOne.mock.calls[0][1] as any;
      expect(update.$set.status).toBe(OfferStatus.ACTIVE);
    });

    it('should reactivate sold_out offer when stock is replenished', async () => {
      const soldOut = {
        ...mockOffer,
        status: OfferStatus.SOLD_OUT,
        stock: 0,
      };
      repository.findOne.mockResolvedValue(soldOut);
      repository.updateOne.mockResolvedValue(soldOut);

      await service.update(offerId, { stock: 5 }, ownerId);

      const update = repository.updateOne.mock.calls[0][1] as any;
      expect(update.$set.status).toBe(OfferStatus.ACTIVE);
    });

    it('should respect explicit status from dto and skip auto-reactivation', async () => {
      const expired = { ...mockOffer, status: OfferStatus.EXPIRED, stock: 3 };
      repository.findOne.mockResolvedValue(expired);
      repository.updateOne.mockResolvedValue(expired);

      const future = new Date(Date.now() + 86_400_000);
      await service.update(
        offerId,
        { expiresAt: future, status: OfferStatus.INACTIVE },
        ownerId,
      );

      const update = repository.updateOne.mock.calls[0][1] as any;
      expect(update.$set.status).toBe(OfferStatus.INACTIVE);
    });

    it('should not change status on simple field edit of active offer', async () => {
      repository.findOne.mockResolvedValue(mockOffer);
      repository.updateOne.mockResolvedValue(mockOffer);

      await service.update(offerId, { title: 'New' }, ownerId);

      const update = repository.updateOne.mock.calls[0][1] as any;
      expect(update.$set.status).toBeUndefined();
    });
  });

  describe('close', () => {
    it('should set status to inactive', async () => {
      repository.findOne.mockResolvedValue(mockOffer);
      repository.updateOne.mockResolvedValue({
        ...mockOffer,
        status: OfferStatus.INACTIVE,
      });

      await service.close(offerId, ownerId);

      const update = repository.updateOne.mock.calls[0][1] as any;
      expect(update.$set.status).toBe(OfferStatus.INACTIVE);
    });

    it('should throw ForbiddenException if not owner', async () => {
      repository.findOne.mockResolvedValue(mockOffer);
      const otherId = new Types.ObjectId().toString();

      await expect(service.close(offerId, otherId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
