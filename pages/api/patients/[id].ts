import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Patient from '../../../models/Patient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid patient ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get single patient
      const patient = await Patient.findById(id);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      return res.status(200).json(patient);
    }

    if (req.method === 'PUT') {
      // Update patient
      const patient = await Patient.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      return res.status(200).json(patient);
    }

    if (req.method === 'DELETE') {
      // Delete patient
      const patient = await Patient.findByIdAndDelete(id);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      return res.status(200).json({ message: 'Patient deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
} 