import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChat extends Document {
  _id: Types.ObjectId;
  title: string;
  type: 'direct' | 'group';
  participantIds: Types.ObjectId[];
  mutedBy: Types.ObjectId[];
  archivedBy: Types.ObjectId[];
  lastMessageAt?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true,
  },
  participantIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  mutedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  archivedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  lastMessageAt: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Индексы для оптимизации запросов
ChatSchema.index({ participantIds: 1 });
ChatSchema.index({ type: 1 });
ChatSchema.index({ lastMessageAt: -1 });
ChatSchema.index({ createdAt: -1 });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
