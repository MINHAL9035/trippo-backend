import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class OwnerRefreshToken extends Document {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true, ref: 'Owner' })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  expiryDate: Date;
}

export const OwnerRefreshTokenSchema =
  SchemaFactory.createForClass(OwnerRefreshToken);
