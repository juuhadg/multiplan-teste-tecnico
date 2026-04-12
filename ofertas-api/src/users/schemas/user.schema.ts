import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../../auth/enums/role.enum';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, type: String, enum: Role })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
