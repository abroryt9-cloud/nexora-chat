import mongoose, { Schema, Document } from 'mongoose';

export interface IReport {
  reporterId: string;
  reportedId: string;
  type: 'user' | 'message' | 'chat';
  targetId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport & Document>({
  reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['user', 'message', 'chat'], required: true },
  targetId: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
}, { timestamps: true });

export default mongoose.model<IReport & Document>('Report', ReportSchema);
