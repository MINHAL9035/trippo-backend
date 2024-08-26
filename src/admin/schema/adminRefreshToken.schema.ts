import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class AdminRefreshToken extends Document {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  expiryDate: Date;
}

export const AdminRefreshTokenSchema =
  SchemaFactory.createForClass(AdminRefreshToken);
