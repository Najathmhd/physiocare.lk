import type { NextApiRequest, NextApiResponse } from 'next';
import { sendAppointmentConfirmation, sendAppointmentStatusUpdate, sendPaymentConfirmationEmail } from '../../src/utils/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type = 'confirmation', testEmail = 'azrinphysiocare@gmail.com' } = req.body;

  try {
    const baseData = {
      patientName: 'Najath Mohomed',
      patientEmail: testEmail,
      service: 'Physical Therapy (Comprehensive)',
      date: '2026-10-25',
      time: '10:30 AM',
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentAmount: 4500,
      paymentMethod: 'cash',
      receiptNumber: 'RCP-2026-889921',
      clinicName: 'Physio Care',
      clinicPhone: '+94 77 337 8718',
      clinicAddress: '49, Masjid Mawatha, Warakapola, Sri Lanka',
    };

    let result;
    if (type === 'status') {
      result = await sendAppointmentStatusUpdate(baseData);
    } else if (type === 'payment') {
      result = await sendPaymentConfirmationEmail({
        ...baseData,
        paidAt: new Date().toLocaleString(),
      });
    } else {
      result = await sendAppointmentConfirmation(baseData);
    }

    if (result.success) {
      return res.status(200).json({ 
        message: `${type} email sent successfully!`, 
        messageId: result.messageId 
      });
    } else {
      return res.status(500).json({ 
        message: `Failed to send ${type} email`, 
        error: result.error 
      });
    }
  } catch (error: any) {
    return res.status(500).json({ 
      message: 'Error sending test email', 
      error: error.message 
    });
  }
}