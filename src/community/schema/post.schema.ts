import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  place: string;

  @Prop({ type: [String], required: true })
  imageUrl: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
