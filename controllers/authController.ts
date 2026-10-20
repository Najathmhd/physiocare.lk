import type { NextApiRequest, NextApiResponse } from 'next';
import User from '../models/User';
import dbConnect from '../utils/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024';

export default async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  await dbConnect();

  let user = await User.findOne({ email: email.toLowerCase().trim() });
  
  // If no user exists in the database, seed default admin on initial login
  if (!user) {
    const totalUsers = await User.countDocuments();
    if (totalUsers === 0 && email.toLowerCase().trim() === 'azrinphysiocare@gmail.com' && password === 'admin123') {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      user = await User.create({
        name: 'Physio Care Admin',
        email: 'azrinphysiocare@gmail.com',
        password: hashedPassword,
        role: 'admin',
      });
    }
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  return res.status(200).json({
    message: 'Login successful',
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
} 