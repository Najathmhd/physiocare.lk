import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Service from '../../../models/Service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid service ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get single service
      const service = await Service.findById(id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      return res.status(200).json(service);
    }

    if (req.method === 'PUT') {
      // Update service — use $set to safely handle partial updates
      const { _id, __v, createdAt, updatedAt, ...safeFields } = req.body;
      const service = await Service.findByIdAndUpdate(
        id,
        { $set: safeFields },
        { new: true, runValidators: false }
      );
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      return res.status(200).json(service);
    }

    if (req.method === 'DELETE') {
      // Delete service
      const service = await Service.findByIdAndDelete(id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      return res.status(200).json({ message: 'Service deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
} 