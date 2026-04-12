import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  findOne(filter: UserFilterDto): Promise<HydratedDocument<User> | null> {
    return this.userModel.findOne(filter).exec();
  }

  findOneWithPassword(
    filter: UserFilterDto,
  ): Promise<HydratedDocument<User> | null> {
    return this.userModel.findOne(filter).select('+password').exec();
  }

  create(data: CreateUserDto): Promise<HydratedDocument<User>> {
    return this.userModel.create(data);
  }
}
