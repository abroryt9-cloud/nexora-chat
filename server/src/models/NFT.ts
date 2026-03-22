import mongoose, { Schema, Document } from 'mongoose';
import { INFT } from '@nexora/shared';

const NFTSchema = new Schema<INFT & Document>({
  name: { type: String, required: true },
  description: String,
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
}, { timestamps: true });

export default mongoose.model<INFT & Document>('NFT', NFTSchema);
