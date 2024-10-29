import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AiTrip extends Document {
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  tripId: string;

  @Prop({
    type: {
      place: String,
      days: String,
      budget: String,
      travelers: String,
    },
    required: true,
  })
  userInput: {
    place: string;
    days: string;
    budget: string;
    travelers: string;
  };

  @Prop({ type: Object })
  tripData: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const AiTripSchema = SchemaFactory.createForClass(AiTrip);
