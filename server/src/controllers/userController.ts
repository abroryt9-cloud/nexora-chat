import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { uploadToCloudinary } from '../services/uploadService';
import { achievementsList } from '@nexora/shared';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username, avatar, language, theme } = req.body;
    const updates: any = {};
    if (username) updates.username = username;
    if (avatar) updates.avatar = avatar;
    if (language) updates.language = language;
    if (theme) updates.theme = theme;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const imageUrl = await uploadToCloudinary(req.file.path);
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: imageUrl }, { new: true });
    res.json({ avatar: user?.avatar });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('statistics');
    res.json(user?.statistics);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('achievements statistics');
    const unlockedIds = user?.achievements?.map(a => a.id) || [];
    const allAchievements = achievementsList.map(ach => ({
      ...ach,
      unlocked: unlockedIds.includes(ach.id),
      unlockedAt: user?.achievements?.find(a => a.id === ach.id)?.unlockedAt,
    }));
    res.json(allAchievements);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
