import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { OfferStatus } from '../offers/enums/offer-status.enum';
import { OffersRepository } from '../offers/offers.repository';
import { InterestsRepository } from './interests.repository';
import { InterestsService } from './interests.service';

describe('InterestsService', () => {
  let service: InterestsService;
  let interestsRepo: jest.Mocked<InterestsRepository>;
  let offersRepo: jest.Mocked<OffersRepository>;

  const offerId = new Types.ObjectId().toString();
  const buyerId = new Types.ObjectId().toString();

  const mockInterest = {
    _id: new Types.ObjectId(),
    offerId: new Types.ObjectId(offerId),
    buyerId: new Types.ObjectId(buyerId),
  } as any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        InterestsService,
        {
          provide: InterestsRepository,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: OffersRepository,
          useValue: {
            decrementStock: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(InterestsService);
    interestsRepo = module.get(InterestsRepository);
    offersRepo = module.get(OffersRepository);
  });

  describe('register', () => {
    it('should create interest and decrement stock', async () => {
      interestsRepo.findOne.mockResolvedValue(null);
      offersRepo.decrementStock.mockResolvedValue({ stock: 3 } as any);
      interestsRepo.create.mockResolvedValue(mockInterest);

      const result = await service.register(offerId, buyerId);

      expect(offersRepo.decrementStock).toHaveBeenCalledWith(offerId);
      expect(interestsRepo.create).toHaveBeenCalled();
      expect(result).toBe(mockInterest);
    });

    it('should throw ConflictException if already interested', async () => {
      interestsRepo.findOne.mockResolvedValue(mockInterest);

      await expect(service.register(offerId, buyerId)).rejects.toThrow(
        ConflictException,
      );
      expect(offersRepo.decrementStock).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if offer unavailable', async () => {
      interestsRepo.findOne.mockResolvedValue(null);
      offersRepo.decrementStock.mockResolvedValue(null);

      await expect(service.register(offerId, buyerId)).rejects.toThrow(
        ConflictException,
      );
      expect(interestsRepo.create).not.toHaveBeenCalled();
    });

    it('should mark offer as sold out when stock reaches 0', async () => {
      interestsRepo.findOne.mockResolvedValue(null);
      offersRepo.decrementStock.mockResolvedValue({
        _id: new Types.ObjectId(offerId),
        stock: 0,
      } as any);
      interestsRepo.create.mockResolvedValue(mockInterest);

      await service.register(offerId, buyerId);

      expect(offersRepo.updateOne).toHaveBeenCalledWith(
        { _id: offerId },
        { $set: { status: OfferStatus.SOLD_OUT } },
      );
    });

    it('should not deactivate offer when stock > 0', async () => {
      interestsRepo.findOne.mockResolvedValue(null);
      offersRepo.decrementStock.mockResolvedValue({ stock: 2 } as any);
      interestsRepo.create.mockResolvedValue(mockInterest);

      await service.register(offerId, buyerId);

      expect(offersRepo.updateOne).not.toHaveBeenCalled();
    });
  });
});
