import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({
    type: [
      { userId: { type: Types.ObjectId, ref: 'User' }, text: { type: String } },
    ],
    default: [],
  })
  replies: { userId: Types.ObjectId; text: string }[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
