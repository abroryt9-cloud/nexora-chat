import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Message from '../models/Message';
import Report from '../models/Report';
import { logger } from '../utils/logger';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'username')
      .populate('reportedId', 'username')
      .populate('resolvedBy', 'username');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resolveReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { action } = req.body; // 'warn', 'suspend', 'ban'
    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    report.status = 'resolved';
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();
    // Apply action to reported user
    const reportedUser = await User.findById(report.reportedId);
    if (reportedUser && action === 'suspend') {
      reportedUser.role = 'suspended';
      await reportedUser.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();
    const activeUsers = await User.countDocuments({ isOnline: true });
    res.json({ totalUsers, totalMessages, activeUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSystemLogs = async (req: AuthRequest, res: Response) => {
  try {
    // В реальности читаем логи из файла
    res.json({ logs: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
