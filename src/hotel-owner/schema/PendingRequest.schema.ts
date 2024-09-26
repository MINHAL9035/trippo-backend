import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OwnerRequest extends Document {
  @Prop({ required: true, ref: 'UnverifiedOwner' })
  ownerId: Types.ObjectId;

  @Prop({ required: true, ref: 'Hotel' })
  hotelId: Types.ObjectId;

  @Prop({
    required: true,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected'],
  })
  status: string;
}
export const ownerRequestSchema = SchemaFactory.createForClass(OwnerRequest);
