import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export const createTestingMongoModule = () =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod = await MongoMemoryServer.create();
      return { uri: mongod.getUri(), autoIndex: true };
    },
  });

export const closeMongoConnection = async () => {
  if (mongod) await mongod.stop();
};
