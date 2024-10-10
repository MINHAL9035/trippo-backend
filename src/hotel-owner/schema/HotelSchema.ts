import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Hotel extends Document {
  @Prop({ required: true, ref: 'Owner' })
  ownerId: Types.ObjectId;

  @Prop({ required: false })
  hotelName?: string;

  @Prop({ required: false })
  streetAddress?: string;

  @Prop({ required: false })
  place?: string;

  @Prop({ required: false })
  state?: string;

  @Prop({ required: false })
  country?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: [String], required: false })
  images?: string[];

  @Prop({ required: false })
  hotelType?: string;

  @Prop({ type: [String], required: false })
  amenities?: string[];

  @Prop({
    type: [
      {
        roomId: { type: String, default: () => uuidv4() },
        type: { type: String },
        rate: Number,
        capacity: Number,
        available: Number,
        amenities: [String],
        availableDates: [Date],
      },
    ],
    required: false,
  })
  rooms?: {
    roomId: string;
    type: string;
    rate: number;
    capacity: number;
    available: number;
    amenities: string[];
    availableDates: Date[];
  }[];
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);
