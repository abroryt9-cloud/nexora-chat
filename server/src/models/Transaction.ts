import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  amount: number;
  type: 'transfer' | 'reward' | 'referral';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  fromUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  type: {
    type: String,
    enum: ['transfer', 'reward', 'referral'],
    default: 'transfer',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  description: {
    type: String,
    maxlength: 200,
    default: '',
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Индексы
TransactionSchema.index({ fromUserId: 1, createdAt: -1 });
TransactionSchema.index({ toUserId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ status: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
