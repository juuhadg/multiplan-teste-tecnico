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

  deleteOne(filter: InterestFilterDto): Promise<{ deletedCount: number }> {
    return this.interestModel.deleteOne(filter).exec();
  }

  findOfferIdsByBuyer(
    buyerId: Types.ObjectId,
    offerIds: Types.ObjectId[],
  ): Promise<Types.ObjectId[]> {
    if (offerIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.interestModel
      .find({
        buyerId,
        offerId: { $in: offerIds },
      })
      .select('offerId')
      .lean()
      .exec()
      .then((docs) =>
        docs.map((d) => {
          const oid = d.offerId as Types.ObjectId | string;
          return oid instanceof Types.ObjectId
            ? oid
            : new Types.ObjectId(String(oid));
        }),
      );
  }
}
