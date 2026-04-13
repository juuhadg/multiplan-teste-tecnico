import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { OffersModule } from '../offers/offers.module';
import { InterestsController } from './interests.controller';
import { InterestsRepository } from './interests.repository';
import { InterestsService } from './interests.service';
import { Interest, InterestSchema } from './schemas/interest.schema';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => OffersModule),
    MongooseModule.forFeature([
      { name: Interest.name, schema: InterestSchema },
    ]),
  ],
  controllers: [InterestsController],
  providers: [InterestsService, InterestsRepository],
  exports: [InterestsService, InterestsRepository],
})
export class InterestsModule {}
