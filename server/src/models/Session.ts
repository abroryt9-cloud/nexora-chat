import mongoose, { Schema, Document } from 'express-session';

const SessionSchema = new Schema({
  sid: { type: String, required: true, unique: true },
  expires: Date,
  data: String,
});

export default mongoose.model('Session', SessionSchema);
