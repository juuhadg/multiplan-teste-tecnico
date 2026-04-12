import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { InterestFilterDto } from './dto/interest-filter.dto';
import { Interest } from './schemas/interest.schema';

export type CreateInterestData = {
  offerId: Types.ObjectId;
  buyerId: Types.ObjectId;
};

@Injectable()
export class InterestsRepository {
  constructor(
    @InjectModel(Interest.name)
    private readonly interestModel: Model<Interest>,
  ) {}

  findOne(
    filter: InterestFilterDto,
  ): Promise<HydratedDocument<Interest> | null> {
    return this.interestModel.findOne(filter).exec();
  }

  create(data: CreateInterestData): Promise<HydratedDocument<Interest>> {
    return this.interestModel.create(data);
  }
}
