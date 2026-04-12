import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { Role } from '../auth/enums/role.enum';
import {
  closeMongoConnection,
  createTestingMongoModule,
} from '../test/mongo-memory-test-db';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let connection: Connection;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        createTestingMongoModule(),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UsersRepository],
    }).compile();

    repository = module.get(UsersRepository);
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

  const userData = {
    email: 'test@test.com',
    password: 'hashed-password',
    name: 'Test User',
    role: Role.LOJISTA,
  };

  describe('create', () => {
    it('should persist and return a user document', async () => {
      const user = await repository.create(userData);

      expect(user._id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe(userData.role);
    });
  });

  describe('findOne', () => {
    it('should return user by email without password', async () => {
      await repository.create(userData);

      const found = await repository.findOne({ email: userData.email });

      expect(found).not.toBeNull();
      expect(found!.email).toBe(userData.email);
      expect(found!.password).toBeUndefined();
    });

    it('should return null if not found', async () => {
      const found = await repository.findOne({ email: 'no@no.com' });

      expect(found).toBeNull();
    });
  });

  describe('findOneWithPassword', () => {
    it('should return user with password field', async () => {
      await repository.create(userData);

      const found = await repository.findOneWithPassword({
        email: userData.email,
      });

      expect(found).not.toBeNull();
      expect(found!.email).toBe(userData.email);
      expect(found!.password).toBe(userData.password);
    });
  });
});
