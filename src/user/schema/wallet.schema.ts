import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Wallet extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  balance: number;

  @Prop({
    type: [
      {
        amount: { type: Number, required: true },
        type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
        description: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  })
  transactions: Array<{
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    description: string;
    createdAt: Date;
  }>;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
