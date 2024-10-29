import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UnverifiedUser extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'https://github.com/shadcn.png' })
  image: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: false })
  is_blocked: boolean;

  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role: string;
}

export const unverifiedUserSchema =
  SchemaFactory.createForClass(UnverifiedUser);
