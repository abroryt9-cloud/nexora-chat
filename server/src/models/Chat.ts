import mongoose, { Schema, Document } from 'mongoose';
import { IChat, IPoll, IScheduledMessage } from '@nexora/shared';

const PollOptionSchema = new Schema({
  text: String,
  votes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

const PollSchema = new Schema<IPoll>({
  question: { type: String, required: true },
  options: [PollOptionSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  isAnonymous: { type: Boolean, default: false },
});

const ScheduledMessageSchema = new Schema<IScheduledMessage>({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  scheduledFor: { type: Date, required: true },
  sent: { type: Boolean, default: false },
}, { timestamps: true });

const ChatSchema = new Schema<IChat & Document>({
  type: { type: String, enum: ['private', 'group'], required: true },
  name: { type: String, default: '' },
  avatar: { type: String, default: '' },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  isArchived: { type: Boolean, default: false },
  isMuted: { type: Boolean, default: false },
}, { timestamps: true });

export const Chat = mongoose.model<IChat & Document>('Chat', ChatSchema);
export const Poll = mongoose.model<IPoll>('Poll', PollSchema);
export const ScheduledMessage = mongoose.model<IScheduledMessage>('ScheduledMessage', ScheduledMessageSchema);
