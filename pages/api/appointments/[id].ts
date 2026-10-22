import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Appointment from '../../../models/Appointment';
import Settings from '../../../models/Settings';
import { sendAppointmentStatusUpdate, sendPaymentConfirmationEmail } from '../../../src/utils/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid appointment ID' });
  }

  try {
    if (req.method === 'GET') {
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      return res.status(200).json(appointment);
    }

    if (req.method === 'PUT') {
      const originalAppointment = await Appointment.findById(id);
      if (!originalAppointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const updateData = { ...req.body };

      // Handle Payment Confirmation
      let shouldSendPaymentEmail = false;
      if (updateData.paymentStatus === 'paid' && originalAppointment.paymentStatus !== 'paid') {
        if (!updateData.receiptNumber && !originalAppointment.receiptNumber) {
          updateData.receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        }
        updateData.paidAt = new Date();
        shouldSendPaymentEmail = true;
      }

      const { _id, __v, createdAt, updatedAt, ...safeUpdateData } = updateData;
      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { $set: safeUpdateData },
        { new: true, runValidators: false }
      );
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const settings = await Settings.findOne();
      const clinicName = settings?.clinicName || 'Physio Care';
      const clinicPhone = settings?.clinicPhone || '+94 77 337 8718';
      const clinicAddress = settings?.clinicAddress || '49, Masjid Mawatha, Warakapola, Sri Lanka';
      const clinicWebsite = settings?.clinicWebsite || '';

      // 1. Send Payment Confirmation Email
      if (shouldSendPaymentEmail || req.body.sendPaymentReceipt) {
        try {
          await sendPaymentConfirmationEmail({
            patientName: appointment.patientName,
            patientEmail: appointment.email,
            service: appointment.service,
            date: appointment.date,
            time: appointment.time,
            paymentAmount: Number(appointment.paymentAmount) || 0,
            paymentMethod: appointment.paymentMethod || 'cash',
            receiptNumber: appointment.receiptNumber || `RCP-${Date.now().toString().slice(-6)}`,
            paidAt: new Date().toLocaleString(),
            clinicName,
            clinicPhone,
            clinicAddress,
            clinicWebsite,
          });
        } catch (payEmailErr) {
          console.error('Error sending payment receipt email:', payEmailErr);
        }
      }

      // 2. Send Status Update Email if status changed or explicitly requested
      const statusChanged = req.body.status && req.body.status !== originalAppointment.status;
      if (statusChanged || req.body.sendNotification || req.body.sendStatusEmail) {
        try {
          await sendAppointmentStatusUpdate({
            patientName: appointment.patientName,
            patientEmail: appointment.email,
            service: appointment.service,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
            clinicName,
            clinicPhone,
            clinicAddress,
            clinicWebsite,
          });
        } catch (statusEmailErr) {
          console.error('Error sending status update email:', statusEmailErr);
        }
      }

      return res.status(200).json(appointment);
    }

    if (req.method === 'DELETE') {
      const appointment = await Appointment.findByIdAndDelete(id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      return res.status(200).json({ message: 'Appointment deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Appointment API error:', error);
    return res.status(500).json({ message: error.message });
  }
}