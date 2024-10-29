import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UnverifiedHotel extends Document {
  @Prop({ required: true, ref: 'UnverifiedOwner' })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  hotelName: string;

  @Prop({ required: true })
  streetAddress: string;

  @Prop({ required: true })
  place: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ default: false })
  isVerified: boolean;
}

export const UnverifiedHotelSchema =
  SchemaFactory.createForClass(UnverifiedHotel);
