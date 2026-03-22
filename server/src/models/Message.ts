import mongoose, { Schema, Document } from 'mongoose';
import { IMessage, IReaction } from '@nexora/shared';

const ReactionSchema = new Schema<IReaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true },
});

const MessageSchema = new Schema<IMessage & Document>({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'sticker', 'gif', 'voice', 'poll'], default: 'text' },
  mediaUrl: { type: String, default: '' },
  reactions: [ReactionSchema],
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  edited: { type: Boolean, default: false },
  editedAt: Date,
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IMessage & Document>('Message', MessageSchema);
