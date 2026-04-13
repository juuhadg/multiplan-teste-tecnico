import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { InterestsModule } from '../interests/interests.module';
import { OffersController } from './offers.controller';
import { OffersCron } from './offers.cron';
import { OffersGateway } from './offers.gateway';
import { OffersRepository } from './offers.repository';
import { OffersService } from './offers.service';
import { Offer, OfferSchema } from './schemas/offer.schema';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => InterestsModule),
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
  ],
  controllers: [OffersController],
  providers: [OffersService, OffersRepository, OffersGateway, OffersCron],
  exports: [OffersRepository],
})
export class OffersModule {}
