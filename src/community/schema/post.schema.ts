import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Comment, CommentSchema } from './comment.schema';

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
