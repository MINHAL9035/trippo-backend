import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UnverifiedOwner extends Document {
  @Prop({ required: true })
  email: string;

  @IsOptional()
  @Prop()
  firstName: string;

  @IsOptional()
  @Prop()
  lastName: string;

  @IsOptional()
  @Prop()
  mobileNumber: string;

  @IsOptional()
  @Prop()
  password: string;

  @Prop({ required: true, default: false })
  is_verified: boolean;
}

export const unverifiedOwnerSchema =
  SchemaFactory.createForClass(UnverifiedOwner);
