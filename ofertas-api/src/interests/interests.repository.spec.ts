import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Types } from 'mongoose';
import {
  closeMongoConnection,
  createTestingMongoModule,
} from '../test/mongo-memory-test-db';
import { Interest, InterestSchema } from './schemas/interest.schema';
import { InterestsRepository } from './interests.repository';

describe('InterestsRepository', () => {
  let repository: InterestsRepository;
  let connection: Connection;

  const offerId = new Types.ObjectId();
  const buyerId = new Types.ObjectId();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        createTestingMongoModule(),
        MongooseModule.forFeature([
          { name: Interest.name, schema: InterestSchema },
        ]),
      ],
      providers: [InterestsRepository],
    }).compile();

    repository = module.get(InterestsRepository);
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
    it('should persist an interest', async () => {
      const interest = await repository.create({ offerId, buyerId });

      expect(interest._id).toBeDefined();
      expect(interest.offerId.toString()).toBe(offerId.toString());
      expect(interest.buyerId.toString()).toBe(buyerId.toString());
    });

    it('should reject duplicate offerId + buyerId', async () => {
      await repository.create({ offerId, buyerId });

      await expect(
        repository.create({ offerId, buyerId }),
      ).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return existing interest', async () => {
      const created = await repository.create({ offerId, buyerId });

      const found = await repository.findOne({
        _id: created._id.toString(),
      });

      expect(found).not.toBeNull();
      expect(found!.buyerId.toString()).toBe(buyerId.toString());
    });

    it('should return null if not found', async () => {
      const found = await repository.findOne({
        _id: new Types.ObjectId().toString(),
      });

      expect(found).toBeNull();
    });
  });
});
