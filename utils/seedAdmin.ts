import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import dbConnect from './db';

const seedAdmin = async () => {
  await dbConnect();
  const adminEmail = 'azrinphysiocare@gmail.com';
  const adminPassword = 'admin123';
  const adminName = 'Physio Care Admin';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: 'admin',
    });
    console.log('Admin user seeded');
  } else {
    console.log('Admin user already exists');
  }
  mongoose.connection.close();
};

seedAdmin(); 