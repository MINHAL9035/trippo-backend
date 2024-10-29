import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PendingBooking extends Document {
  @Prop()
  bookingId: string;

  @Prop({ required: true })
  checkIn: Date;

  @Prop({ required: true })
  checkOut: Date;

  @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true })
  hotelId: Types.ObjectId;

  @Prop({ required: true })
  roomId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  roomRate: number;

  @Prop({ required: true })
  rooms: number;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ required: true })
  nights: number;

  @Prop({ default: 'pending' })
  status: string;
}

export const PendingBookingSchema =
  SchemaFactory.createForClass(PendingBooking);
