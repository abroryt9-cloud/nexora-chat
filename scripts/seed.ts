import mongoose from 'mongoose';
import User from '../server/src/models/User';
import { hashPassword } from '../server/src/utils/hash';

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  await User.deleteMany({});
  const admin = await User.create({
    username: 'admin',
    email: 'admin@nexora.com',
    password: await hashPassword('admin123'),
    role: 'superadmin',
    wallet: { address: '0xadmin', balance: 1000, transactions: [] },
  });
  console.log('Admin created:', admin);
  process.exit();
};

seed();
