import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Staff from '../../../models/Staff';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  if (req.method === 'GET') {
    // List all staff
    try {
      const staff = await Staff.find().sort({ createdAt: -1 });
      return res.status(200).json(staff);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      return res.status(500).json({ message: 'Failed to fetch staff', error: error.message });
    }
  }
  
  if (req.method === 'POST') {
    // Create new staff member
    try {
      const staffMember = await Staff.create(req.body);
      return res.status(201).json(staffMember);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 