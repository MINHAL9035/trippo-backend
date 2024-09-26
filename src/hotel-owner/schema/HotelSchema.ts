import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Hotel extends Document {
  @Prop({ required: true, ref: 'UnverifiedOwner' })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  hotelName: string;

  @Prop({ required: true })
  roomType: string;

  @Prop({ required: true })
  numberOfRooms: string;

  @Prop({ required: true })
  streetAddress: string;

  @Prop({ required: true })
  place: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  price: string;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);
