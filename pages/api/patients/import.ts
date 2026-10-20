import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Patient from '../../../models/Patient';
import { withAuth } from '../../../middlewares/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const patients = req.body;
  if (!Array.isArray(patients)) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  let added = 0, updated = 0, skipped = 0;
  for (const p of patients) {
    if (!p.email && !p.phone) { skipped++; continue; }
    const existing = await Patient.findOne({ $or: [ { email: p.email }, { phone: p.phone } ] });
    if (existing) {
      await Patient.findByIdAndUpdate(existing._id, p);
      updated++;
    } else {
      await Patient.create(p);
      added++;
    }
  }
  return res.status(200).json({ added, updated, skipped });
}

export default withAuth(handler); 