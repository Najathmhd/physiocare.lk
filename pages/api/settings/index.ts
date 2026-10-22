import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Settings from '../../../models/Settings';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    // Get settings (create default if none exist)
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings
      settings = await Settings.create({
        clinicName: 'Physio Care',
        clinicAddress: '49, Masjid Mawatha, Warakapola, Sri Lanka',
        clinicPhone: '+94 77 337 8718',
        clinicEmail: 'azrinphysiocare@gmail.com',
        clinicWebsite: 'https://physiocare.com',
        businessHours: {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '15:00', closed: false },
          sunday: { open: '00:00', close: '00:00', closed: true }
        },
        appointmentSettings: {
          slotDuration: 30,
          maxAppointmentsPerDay: 20,
          advanceBookingDays: 30,
          cancellationHours: 24
        },
        notificationSettings: {
          emailNotifications: true,
          smsNotifications: true,
          reminderHours: 24
        }
      });
    }
    return res.status(200).json(settings);
  }
  
  if (req.method === 'PUT') {
    // Update settings
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        // Create new settings if none exist
        settings = await Settings.create(req.body);
      } else {
        // Update existing settings
        settings = await Settings.findOneAndUpdate(
          {},
          req.body,
          { new: true, runValidators: true }
        );
      }
      return res.status(200).json(settings);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 