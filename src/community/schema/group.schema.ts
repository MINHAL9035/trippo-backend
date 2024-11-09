import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Group extends Document {
  @Prop({ required: true })
  groupId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  members: Types.ObjectId[];

  // @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  // createdBy: Types.ObjectId;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
