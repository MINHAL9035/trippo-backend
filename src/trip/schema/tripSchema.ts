import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Trip extends Document {
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  tripName: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  tripStartDate: Date;

  @Prop({ required: true })
  tripEndDate: Date;

  @Prop({ required: true })
  imageUrl: string;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
