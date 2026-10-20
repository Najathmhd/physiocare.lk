import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Staff from '../../../models/Staff';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid staff ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get single staff member
      const staff = await Staff.findById(id);
      if (!staff) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      return res.status(200).json(staff);
    }

    if (req.method === 'PUT') {
      // Update staff member — use $set to safely handle partial updates
      const { _id, __v, createdAt, updatedAt, ...safeFields } = req.body;
      const staff = await Staff.findByIdAndUpdate(
        id,
        { $set: safeFields },
        { new: true, runValidators: false }
      );
      if (!staff) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      return res.status(200).json(staff);
    }

    if (req.method === 'DELETE') {
      // Delete staff member
      const staff = await Staff.findByIdAndDelete(id);
      if (!staff) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      return res.status(200).json({ message: 'Staff member deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
} 