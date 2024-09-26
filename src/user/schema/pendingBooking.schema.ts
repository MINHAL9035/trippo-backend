import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PendingBooking extends Document {
  @Prop({ required: true })
  bookingId: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  checkIn: Date;

  @Prop({ required: true })
  checkOut: Date;

  @Prop({ required: true, min: 1 })
  rooms: number;

  @Prop({ required: true, min: 1 })
  adults: number;

  @Prop({ type: [Number], default: [] })
  children: number[];

  @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true })
  hotelId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ default: 'pending' })
  status: string;
}
export const PendingBookingSchema =
  SchemaFactory.createForClass(PendingBooking);
