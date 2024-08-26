import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Trip extends Document {
  @Prop({ required: true })
  tripName: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ type: Number, required: false })
  lengthOfStay?: number;

  @Prop({ type: Date, required: false })
  startDate?: Date;

  @Prop({ type: Date, required: false })
  endDate?: Date;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
