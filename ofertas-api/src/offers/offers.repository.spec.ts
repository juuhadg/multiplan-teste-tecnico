import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Types } from 'mongoose';
import {
  closeMongoConnection,
  createTestingMongoModule,
} from '../test/mongo-memory-test-db';
import { OfferStatus } from './enums/offer-status.enum';
import { Offer, OfferSchema } from './schemas/offer.schema';
import { OffersRepository } from './offers.repository';

describe('OffersRepository', () => {
  let repository: OffersRepository;
  let connection: Connection;

  const ownerId = new Types.ObjectId();

  const offerData = {
    title: 'Promo',
    description: 'Great deal',
    discount: 20,
    stock: 5,
    expiresAt: new Date('2030-01-01'),
    ownerId,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        createTestingMongoModule(),
        MongooseModule.forFeature([
          { name: Offer.name, schema: OfferSchema },
        ]),
      ],
      providers: [OffersRepository],
    }).compile();

    repository = module.get(OffersRepository);
    connection = module.get(getConnectionToken());
  });

  afterEach(async () => {
    const collections = connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    await connection.close();
    await closeMongoConnection();
  });

  describe('create', () => {
    it('should persist offer with status active by default', async () => {
      const offer = await repository.create(offerData);

      expect(offer._id).toBeDefined();
      expect(offer.status).toBe(OfferStatus.ACTIVE);
      expect(offer.title).toBe(offerData.title);
    });
  });

  describe('findOne', () => {
    it('should find offer by id', async () => {
      const created = await repository.create(offerData);

      const found = await repository.findOne({ _id: created._id });

      expect(found).not.toBeNull();
      expect(found!._id.toString()).toBe(created._id.toString());
    });
  });

  describe('find', () => {
    it('should return paginated results', async () => {
      await repository.create(offerData);
      await repository.create({ ...offerData, title: 'Second' });
      await repository.create({ ...offerData, title: 'Third' });

      const page1 = await repository.find({}, 1, 2);
      const page2 = await repository.find({}, 2, 2);

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(1);
    });

    it('should filter by status', async () => {
      await repository.create(offerData);
      const closed = await repository.create(offerData);
      await repository.updateOne(
        { _id: closed._id },
        { $set: { status: OfferStatus.INACTIVE } },
      );

      const activeOnly = await repository.find({
        status: OfferStatus.ACTIVE,
      });
      const inactiveOnly = await repository.find({
        status: OfferStatus.INACTIVE,
      });

      expect(activeOnly).toHaveLength(1);
      expect(inactiveOnly).toHaveLength(1);
    });

    it('should filter by ownerId', async () => {
      const otherId = new Types.ObjectId();
      await repository.create(offerData);
      await repository.create({ ...offerData, ownerId: otherId });

      const result = await repository.find({ ownerId });

      expect(result).toHaveLength(1);
    });
  });

  describe('decrementStock', () => {
    it('should decrement stock and return updated offer', async () => {
      const created = await repository.create(offerData);

      const updated = await repository.decrementStock(
        created._id.toString(),
      );

      expect(updated).not.toBeNull();
      expect(updated!.stock).toBe(offerData.stock - 1);
    });

    it('should return null when stock is 0', async () => {
      const created = await repository.create({
        ...offerData,
        stock: 0,
      });

      const result = await repository.decrementStock(
        created._id.toString(),
      );

      expect(result).toBeNull();
    });

    it('should return null when offer is not active', async () => {
      const created = await repository.create(offerData);
      await repository.updateOne(
        { _id: created._id },
        { $set: { status: OfferStatus.INACTIVE } },
      );

      const result = await repository.decrementStock(
        created._id.toString(),
      );

      expect(result).toBeNull();
    });
  });

  describe('updateOne', () => {
    it('should update and return the document', async () => {
      const created = await repository.create(offerData);

      const updated = await repository.updateOne(
        { _id: created._id },
        { $set: { title: 'Updated' } },
      );

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe('Updated');
    });
  });

  describe('expireOffers', () => {
    it('should mark expired active offers as expired', async () => {
      await repository.create({
        ...offerData,
        expiresAt: new Date('2020-01-01'),
      });
      await repository.create(offerData);

      await repository.expireOffers();

      const expired = await repository.find({
        status: OfferStatus.EXPIRED,
      });
      const active = await repository.find({
        status: OfferStatus.ACTIVE,
      });

      expect(expired).toHaveLength(1);
      expect(active).toHaveLength(1);
    });
  });
});
