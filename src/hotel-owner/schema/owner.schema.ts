import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Owner extends Document {
  @Prop({ required: true })
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  password: string;

  @Prop({ required: true, default: false })
  is_verified: boolean;
}

export const OwnerSchema = SchemaFactory.createForClass(Owner);
