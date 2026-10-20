import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Patient from '../../../models/Patient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  if (req.method === 'GET') {
    // List all patients
    try {
      const patients = await Patient.find().sort({ createdAt: -1 });
      return res.status(200).json(patients);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      return res.status(500).json({ message: 'Failed to fetch patients', error: error.message });
    }
  }
  
  if (req.method === 'POST') {
    // Create new patient
    try {
      const patient = await Patient.create(req.body);
      return res.status(201).json(patient);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 