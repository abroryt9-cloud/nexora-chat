import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  _id: Types.ObjectId;
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  replyToId: Types.ObjectId | null;
  reactions: Map<string, string[]>;
  readBy: Types.ObjectId[];
  editedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 4096,
  },
  replyToId: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  reactions: {
    type: Map,
    of: [String],
    default: new Map(),
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  editedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Индексы для оптимизации запросов
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ replyToId: 1 });
MessageSchema.index({ text: 'text' }); // Для полнотекстового поиска

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
