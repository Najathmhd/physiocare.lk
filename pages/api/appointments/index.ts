import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Appointment from '../../../models/Appointment';
import Settings from '../../../models/Settings';
import Service from '../../../models/Service';
import { sendAppointmentConfirmation, sendAdminNewBookingAlert, sendPaymentConfirmationEmail } from '../../../src/utils/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const appointments = await Appointment.find().sort({ createdAt: -1 });
      return res.status(200).json(appointments);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const apptData = { ...req.body };

      // Ensure address is captured if embedded in notes
      if (!apptData.address && apptData.notes && apptData.notes.includes('Visit Address:')) {
        apptData.address = apptData.notes.split('Visit Address:')[1]?.split('\n')[0]?.trim();
      }

      // Validate appointment date is not in the past
      if (apptData.date) {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (apptData.date < todayStr) {
          return res.status(400).json({ message: 'Selected appointment date cannot be in the past. Please choose today or a future date.' });
        }
      }

      // Look up service price if paymentAmount not provided
      if (!apptData.paymentAmount || Number(apptData.paymentAmount) === 0) {
        try {
          const matchedService = await Service.findOne({ name: apptData.service });
          if (matchedService && matchedService.price) {
            apptData.paymentAmount = matchedService.price;
          }
        } catch (sErr) {
          console.warn('Notice: Could not auto-detect service price:', sErr);
        }
      }

      if (apptData.paymentStatus === 'paid') {
        apptData.receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        apptData.paidAt = new Date();
      }

      const appt = await Appointment.create(apptData);

      // Send confirmation & admin alert emails
      try {
        const settings = await Settings.findOne();
        const clinicName = settings?.clinicName || 'Physio Care';
        const clinicPhone = settings?.clinicPhone || '+94 77 337 8718';
        const clinicAddress = settings?.clinicAddress || '49, Masjid Mawatha, Warakapola, Sri Lanka';
        const adminEmail = settings?.clinicEmail || process.env.EMAIL_USER || 'azrinphysiocare@gmail.com';

        // 1. Send confirmation to Patient (tailored for Clinic Visit vs. Home Visit)
        await sendAppointmentConfirmation({
          patientName: appt.patientName,
          patientEmail: appt.email,
          patientPhone: appt.phone,
          service: appt.service,
          date: appt.date,
          time: appt.time,
          status: appt.status || 'pending',
          paymentStatus: appt.paymentStatus || 'unpaid',
          paymentAmount: appt.paymentAmount || 0,
          paymentMethod: appt.paymentMethod || 'cash',
          receiptNumber: appt.receiptNumber,
          address: appt.address,
          notes: appt.notes,
          clinicName,
          clinicPhone,
          clinicAddress,
        });

        // 2. Instantly notify Clinic / Admin of the new booking
        await sendAdminNewBookingAlert({
          patientName: appt.patientName,
          patientEmail: appt.email,
          patientPhone: appt.phone,
          service: appt.service,
          date: appt.date,
          time: appt.time,
          status: appt.status || 'pending',
          paymentStatus: appt.paymentStatus || 'unpaid',
          paymentAmount: appt.paymentAmount || 0,
          paymentMethod: appt.paymentMethod || 'cash',
          receiptNumber: appt.receiptNumber,
          address: appt.address,
          notes: appt.notes,
          clinicName,
          clinicPhone,
          clinicAddress,
          adminEmail,
        });

        if (appt.paymentStatus === 'paid') {
          await sendPaymentConfirmationEmail({
            patientName: appt.patientName,
            patientEmail: appt.email,
            service: appt.service,
            date: appt.date,
            time: appt.time,
            paymentAmount: Number(appt.paymentAmount) || 0,
            paymentMethod: appt.paymentMethod || 'cash',
            receiptNumber: appt.receiptNumber || `RCP-${Date.now().toString().slice(-6)}`,
            paidAt: new Date().toLocaleString(),
            clinicName,
            clinicPhone,
            clinicAddress,
          });
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      // Auto-register or link patient in database
      try {
        const Patient = (await import('../../../models/Patient')).default;
        const existingPatient = await Patient.findOne({
          $or: [{ email: appt.email }, { phone: appt.phone }]
        });
        if (!existingPatient) {
          await Patient.create({
            name: appt.patientName,
            email: appt.email,
            phone: appt.phone,
            dateOfBirth: 'Not specified',
            gender: 'other',
            address: 'Online Booking',
            medicalHistory: appt.notes || 'Booked online via appointment form',
          });
        }
      } catch (patientError) {
        console.error('Auto-patient link notice:', patientError);
      }

      return res.status(201).json(appt);
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      return res.status(400).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}