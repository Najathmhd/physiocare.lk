import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Service from '../../../models/Service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  if (req.method === 'GET') {
    // List all services
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const services = await Service.find().sort({ createdAt: 1 });
      return res.status(200).json(services);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      return res.status(500).json({ message: 'Failed to fetch services', error: error.message });
    }
  }
  
  if (req.method === 'POST') {
    // Create new service
    try {
      const service = await Service.create(req.body);
      return res.status(201).json(service);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 