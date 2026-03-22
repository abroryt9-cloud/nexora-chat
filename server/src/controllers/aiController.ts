import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAIResponse } from '../services/aiService';

export const askAI = async (req: AuthRequest, res: Response) => {
  try {
    const { message, context } = req.body;
    const reply = await getAIResponse(message, context);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: 'AI service error' });
  }
};
