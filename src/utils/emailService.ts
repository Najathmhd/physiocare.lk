import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER || 'azrinphysiocare@gmail.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';

const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

export interface AppointmentEmailData {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  service: string;
  date: string;
  time: string;
  status: string;
  paymentStatus?: string;
  paymentAmount?: number;
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
  address?: string;
  clinicName: string;
  clinicPhone: string;
  clinicAddress: string;
  adminEmail?: string;
}

export interface PaymentEmailData {
  patientName: string;
  patientEmail: string;
  service: string;
  date: string;
  time: string;
  paymentAmount: number;
  paymentMethod: string;
  receiptNumber: string;
  paidAt: string;
  clinicName: string;
  clinicPhone: string;
  clinicAddress: string;
}

const formatLKR = (amount: number | string = 0) => {
  const num = Number(amount) || 0;
  return `LKR ${num.toLocaleString('en-LK')}`;
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// 1. Send Appointment Booking Confirmation Email to Patient
export async function sendAppointmentConfirmation(data: AppointmentEmailData) {
  try {
    const formattedDate = formatDate(data.date);
    const formattedPrice = formatLKR(data.paymentAmount);
    const isHomeVisit = (data.service || '').toLowerCase().includes('home');

    // Instructions customized for Clinic Visit vs. Home Visit
    const instructionsHtml = isHomeVisit
      ? `
        <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 10px 0; color: #166534; font-size: 15px; font-weight: 700; display: flex; align-items: center;">
            🏡 Instructions for Your Bedside Home Visit:
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #1e293b; font-size: 13.5px; line-height: 1.65;">
            <li style="margin-bottom: 6px;">Our certified physiotherapist will visit directly at your designated residence around your scheduled time.</li>
            <li style="margin-bottom: 6px;">Please prepare a comfortable, well-ventilated space (e.g. bed, couch, or firm floor mat) with clear access for physical evaluation.</li>
            <li style="margin-bottom: 6px;">Wear loose, comfortable clothing allowing easy movement and joint mobility assessments.</li>
            <li style="margin-bottom: 6px;">Have any recent doctor prescriptions, hospital discharge summaries, or imaging (MRI / X-ray) ready for therapist review.</li>
            <li>A family member or caregiver is encouraged to be present during the bedside rehabilitation session.</li>
          </ul>
        </div>
      `
      : `
        <div style="background-color: #f0fdfa; border: 1.5px solid #ccfbf1; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 10px 0; color: #0f766e; font-size: 15px; font-weight: 700;">
            📋 Instructions for Your In-Clinic Visit:
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #1e293b; font-size: 13.5px; line-height: 1.65;">
            <li style="margin-bottom: 6px;">Please arrive 10 minutes prior to your allocated time slot.</li>
            <li style="margin-bottom: 6px;">Wear flexible, comfortable attire suitable for movement assessments.</li>
            <li style="margin-bottom: 6px;">Bring any relevant imaging (MRI, X-ray) or doctor referrals.</li>
            <li>Please check in at the reception upon arrival at our Warakapola center.</li>
          </ul>
        </div>
      `;

    // Location details box customized for Home Visit vs Clinic Visit
    const locationDetailsHtml = isHomeVisit
      ? `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 14px; color: #475569;">
          <p style="margin: 0 0 6px 0; color: #166534; font-weight: 700;">
            📍 Home Visit Residence Location:
          </p>
          <p style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px; line-height: 1.5;">
            ${data.address || 'Address provided during booking'}
          </p>
          <p style="margin: 0; font-size: 13px; color: #64748b;">
            📞 <strong>Arrival Support Hotline:</strong> <a href="tel:${data.clinicPhone}" style="color: #0c6f78; font-weight: 700; text-decoration: none;">${data.clinicPhone}</a>
          </p>
        </div>
      `
      : `
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #475569;">
          <p style="margin: 0 0 4px 0;"><strong>📍 Clinic Address:</strong> ${data.clinicAddress}</p>
          <p style="margin: 0;"><strong>📞 Contact Hotline:</strong> <a href="tel:${data.clinicPhone}" style="color: #0c6f78; font-weight: 700; text-decoration: none;">${data.clinicPhone}</a></p>
        </div>
      `;

    const mailOptions = {
      from: `"${data.clinicName}" <${EMAIL_USER}>`,
      to: data.patientEmail,
      subject: `Appointment Booking Received - ${data.clinicName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                  
                  <!-- Medical Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${isHomeVisit ? '#065f46 0%, #047857 60%, #059669 100%' : '#09424c 0%, #0d5f6a 60%, #157987 100%'}); padding: 36px 30px; text-align: center;">
                      <div style="display: inline-block; background: rgba(255,255,255,0.18); border-radius: 50px; padding: 6px 18px; margin-bottom: 12px;">
                        <span style="color: #ffffff; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                          ${isHomeVisit ? 'Bedside & Home Care Rehabilitation' : 'In-Clinic Physiotherapy & Rehabilitation'}
                        </span>
                      </div>
                      <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">${data.clinicName}</h1>
                      <p style="color: #ccfbf1; margin: 0; font-size: 14px;">Official Appointment Confirmation</p>
                    </td>
                  </tr>

                  <!-- Main Body -->
                  <tr>
                    <td style="padding: 36px 32px;">
                      <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Dear ${data.patientName},</p>
                      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                        We have received your appointment reservation for <strong>${data.service}</strong>. Our clinical physiotherapists look forward to providing you with dedicated, compassionate care.
                      </p>

                      <!-- Schedule Card -->
                      <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 5px solid ${isHomeVisit ? '#16a34a' : '#0c6f78'}; border-radius: 10px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 20px;">
                            <table role="presentation" width="100%">
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-weight: 600;">Care Option:</td>
                                <td style="padding: 8px 0; font-size: 15px; color: #0f172a; font-weight: 700; text-align: right;">${data.service}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Appointment Date:</td>
                                <td style="padding: 8px 0; font-size: 15px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px dashed #e2e8f0;">${formattedDate}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Scheduled Time:</td>
                                <td style="padding: 8px 0; font-size: 15px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px dashed #e2e8f0;">${data.time}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Consultation Fee:</td>
                                <td style="padding: 8px 0; font-size: 16px; color: ${isHomeVisit ? '#16a34a' : '#0c6f78'}; font-weight: 800; text-align: right; border-top: 1px dashed #e2e8f0;">${formattedPrice}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Booking Status:</td>
                                <td style="padding: 8px 0; text-align: right; border-top: 1px dashed #e2e8f0;">
                                  <span style="background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">
                                    ${data.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Payment Status:</td>
                                <td style="padding: 8px 0; text-align: right; border-top: 1px dashed #e2e8f0;">
                                  <span style="color: ${data.paymentStatus === 'paid' ? '#16a34a' : '#d97706'}; font-weight: 700; font-size: 13px; text-transform: uppercase;">
                                    ${data.paymentStatus === 'paid' ? '✔ PAID' : (isHomeVisit ? '⏳ UNPAID (Pay during Visit)' : '⏳ UNPAID (Pay at Clinic)')}
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Specific Instructions -->
                      ${instructionsHtml}

                      <!-- Location Specific Info -->
                      ${locationDetailsHtml}
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #072b31; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #0f3f48;">
                      <p style="margin: 0 0 6px 0; color: #ffffff; font-weight: 700; font-size: 13px;">${data.clinicName}</p>
                      <p style="margin: 0 0 6px 0;">Dedicated Clinical Care & Bedside Rehabilitation</p>
                      <p style="margin: 0; font-size: 11px; opacity: 0.7;">© 2026 ${data.clinicName}. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Appointment confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    return { success: false, error: (error as any).message };
  }
}

// 2. Send Instant New Booking Alert to Admin / Clinic
export async function sendAdminNewBookingAlert(data: AppointmentEmailData) {
  try {
    const formattedDate = formatDate(data.date);
    const formattedPrice = formatLKR(data.paymentAmount);
    const isHomeVisit = (data.service || '').toLowerCase().includes('home');
    const adminRecipient = data.adminEmail || EMAIL_USER;

    const mailOptions = {
      from: `"${data.clinicName} Booking System" <${EMAIL_USER}>`,
      to: adminRecipient,
      subject: `🔔 New Booking Alert: [${data.service}] - ${data.patientName} (${formattedDate} at ${data.time})`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Booking Alert</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                  
                  <!-- Alert Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 30px; text-align: center;">
                      <div style="display: inline-block; background: ${isHomeVisit ? '#16a34a' : '#0284c7'}; border-radius: 50px; padding: 5px 16px; margin-bottom: 10px;">
                        <span style="color: #ffffff; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                          ${isHomeVisit ? '🚨 NEW HOME VISIT BOOKING' : '🚨 NEW CLINIC VISIT BOOKING'}
                        </span>
                      </div>
                      <h2 style="color: #ffffff; margin: 0 0 6px 0; font-size: 24px; font-weight: 800;">New Appointment Received</h2>
                      <p style="color: #94a3b8; margin: 0; font-size: 14px;">Instant booking notification from ${data.clinicName} website</p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 32px 30px;">
                      
                      <!-- Patient Overview Card -->
                      <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 5px solid ${isHomeVisit ? '#16a34a' : '#0284c7'}; border-radius: 10px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 20px;">
                            <table role="presentation" width="100%">
                              <tr>
                                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; font-weight: 600;">Patient Name:</td>
                                <td style="padding: 6px 0; font-size: 15px; color: #0f172a; font-weight: 800; text-align: right;">${data.patientName}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Phone Number:</td>
                                <td style="padding: 6px 0; font-size: 15px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px dashed #e2e8f0;">
                                  <a href="tel:${data.patientPhone}" style="color: #0284c7; text-decoration: none; font-weight: 800;">${data.patientPhone || 'Not provided'}</a>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Email Address:</td>
                                <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px dashed #e2e8f0;">
                                  <a href="mailto:${data.patientEmail}" style="color: #0284c7; text-decoration: none;">${data.patientEmail}</a>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Care Option:</td>
                                <td style="padding: 6px 0; font-size: 15px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px dashed #e2e8f0;">
                                  <strong>${data.service}</strong>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Preferred Date:</td>
                                <td style="padding: 6px 0; font-size: 15px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px dashed #e2e8f0;">${formattedDate}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Preferred Time:</td>
                                <td style="padding: 6px 0; font-size: 15px; color: #0f172a; font-weight: 800; text-align: right; border-top: 1px dashed #e2e8f0;">${data.time}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 13.5px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Session Fee:</td>
                                <td style="padding: 6px 0; font-size: 16px; color: #16a34a; font-weight: 800; text-align: right; border-top: 1px dashed #e2e8f0;">${formattedPrice}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Home Visit Address Box if applicable -->
                      ${isHomeVisit ? `
                        <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
                          <h4 style="margin: 0 0 6px 0; color: #166534; font-size: 14px; font-weight: 800;">
                            📍 Patient Residence Location for Home Visit:
                          </h4>
                          <p style="margin: 0; font-size: 14.5px; color: #0f172a; line-height: 1.5; font-weight: 600;">
                            ${data.address || 'Address provided in clinical notes'}
                          </p>
                        </div>
                      ` : ''}

                      <!-- Clinical Notes Box if available -->
                      ${data.notes ? `
                        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
                          <h4 style="margin: 0 0 6px 0; color: #92400e; font-size: 13.5px; font-weight: 700;">
                            📝 Patient Clinical Notes &amp; Symptoms:
                          </h4>
                          <p style="margin: 0; font-size: 13.5px; color: #451a03; line-height: 1.6; white-space: pre-wrap;">
                            ${data.notes}
                          </p>
                        </div>
                      ` : ''}

                      <div style="text-align: center; margin-top: 26px;">
                        <a href="https://physiocare.lk/admin/appointments" style="display: inline-block; background-color: #0c6f78; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none;">
                          Open Staff Portal to Confirm Appointment
                        </a>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #0f172a; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                      <p style="margin: 0;">Automated System Alert • ${data.clinicName} Administration</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin new booking alert email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin new booking alert email:', error);
    return { success: false, error: (error as any).message };
  }
}

// 2. Send Appointment Status Update Email
export async function sendAppointmentStatusUpdate(data: AppointmentEmailData) {
  try {
    const formattedDate = formatDate(data.date);
    const statusUpper = data.status.toUpperCase();

    let statusThemeColor = '#0c6f78';
    let statusBgColor = '#f0fdfa';
    let statusBorderColor = '#ccfbf1';
    let statusMessage = 'Your appointment status has been updated.';

    if (data.status === 'confirmed') {
      statusThemeColor = '#16a34a';
      statusBgColor = '#f0fdf4';
      statusBorderColor = '#bbf7d0';
      statusMessage = 'Great news! Your physiotherapy session has been officially CONFIRMED by our clinic.';
    } else if (data.status === 'completed') {
      statusThemeColor = '#0284c7';
      statusBgColor = '#f0f9ff';
      statusBorderColor = '#bae6fd';
      statusMessage = 'Your physiotherapy session has been marked as COMPLETED. Thank you for choosing us.';
    } else if (data.status === 'cancelled') {
      statusThemeColor = '#dc2626';
      statusBgColor = '#fef2f2';
      statusBorderColor = '#fecaca';
      statusMessage = 'Your appointment has been CANCELLED. If you wish to reschedule, please contact our clinic.';
    }

    const mailOptions = {
      from: `"${data.clinicName}" <${EMAIL_USER}>`,
      to: data.patientEmail,
      bcc: EMAIL_USER, // Sends copy to clinic
      subject: `Status Update: [${statusUpper}] - ${data.clinicName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Status Update</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #09424c 0%, #0d5f6a 60%, #157987 100%); padding: 32px 30px; text-align: center;">
                      <div style="display: inline-block; background: rgba(255,255,255,0.18); border-radius: 50px; padding: 4px 16px; margin-bottom: 10px;">
                        <span style="color: #ffffff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Booking Status Notice</span>
                      </div>
                      <h2 style="color: #ffffff; margin: 0 0 6px 0; font-size: 24px; font-weight: 800;">${data.clinicName}</h2>
                      <p style="color: #ccfbf1; margin: 0; font-size: 14px;">Appointment Status Update</p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 36px 32px;">
                      <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Dear ${data.patientName},</p>
                      
                      <!-- Status Alert Banner -->
                      <div style="background-color: ${statusBgColor}; border: 1px solid ${statusBorderColor}; border-left: 5px solid ${statusThemeColor}; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                        <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: ${statusThemeColor}; margin-bottom: 4px;">Updated Status</div>
                        <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">${statusUpper}</div>
                        <div style="font-size: 14px; color: #475569; line-height: 1.5;">${statusMessage}</div>
                      </div>

                      <!-- Details Table -->
                      <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 16px 20px;">
                            <table role="presentation" width="100%">
                              <tr>
                                <td style="padding: 6px 0; font-size: 14px; color: #64748b; font-weight: 600;">Service:</td>
                                <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">${data.service}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 14px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Date:</td>
                                <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px dashed #e2e8f0;">${formattedDate}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 14px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Time:</td>
                                <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px dashed #e2e8f0;">${data.time}</td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0; font-size: 14px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Location:</td>
                                <td style="padding: 6px 0; font-size: 13px; color: #0f172a; font-weight: 600; text-align: right; border-top: 1px dashed #e2e8f0;">${data.clinicAddress}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                        If you need any adjustments or have inquiries regarding your session, please contact our clinic directly at 
                        <a href="tel:${data.clinicPhone}" style="color: #0c6f78; font-weight: 700; text-decoration: none;">${data.clinicPhone}</a>.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #072b31; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                      <p style="margin: 0 0 4px 0; color: #ffffff; font-weight: 700;">${data.clinicName}</p>
                      <p style="margin: 0; font-size: 11px;">Warakapola, Sri Lanka | ${data.clinicPhone}</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Status update email dispatched:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending status update email:', error);
    return { success: false, error: (error as any).message };
  }
}

// 3. Send Official Payment Confirmation Receipt Email
export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    const formattedDate = formatDate(data.date);
    const formattedPrice = formatLKR(data.paymentAmount);

    const mailOptions = {
      from: `"${data.clinicName} Billing" <${EMAIL_USER}>`,
      to: data.patientEmail,
      bcc: EMAIL_USER, // Sends copy to clinic
      subject: `Payment Receipt [${data.receiptNumber}] - ${data.clinicName}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Receipt</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                  
                  <!-- Green Receipt Banner -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #065f46 0%, #0d5f6a 100%); padding: 32px 30px; text-align: center;">
                      <div style="display: inline-block; background: #22c55e; color: #ffffff; font-size: 11px; font-weight: 800; padding: 5px 16px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                        ✔ Payment Received & Confirmed
                      </div>
                      <h2 style="color: #ffffff; margin: 0 0 4px 0; font-size: 24px; font-weight: 800;">${data.clinicName}</h2>
                      <p style="color: #a7f3d0; margin: 0; font-size: 13px;">Official Clinical Payment Receipt</p>
                    </td>
                  </tr>

                  <!-- Receipt Content -->
                  <tr>
                    <td style="padding: 36px 32px;">
                      <p style="margin: 0 0 14px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Dear ${data.patientName},</p>
                      <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                        Thank you for your payment. Your transaction has been confirmed and recorded into our medical billing ledger.
                      </p>

                      <!-- Receipt Box -->
                      <table role="presentation" width="100%" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 20px;">
                            <table role="presentation" width="100%">
                              <tr>
                                <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600;">Receipt Number:</td>
                                <td style="padding: 7px 0; font-size: 15px; color: #0c6f78; font-weight: 800; text-align: right;">${data.receiptNumber}</td>
                              </tr>
                              <tr>
                                <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Service Rendered:</td>
                                <td style="padding: 7px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; border-top: 1px dashed #e2e8f0;">${data.service}</td>
                              </tr>
                              <tr>
                                <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Appointment Date:</td>
                                <td style="padding: 7px 0; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right; border-top: 1px dashed #e2e8f0;">${formattedDate} at ${data.time}</td>
                              </tr>
                              <tr>
                                <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Payment Method:</td>
                                <td style="padding: 7px 0; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right; text-transform: uppercase; border-top: 1px dashed #e2e8f0;">${data.paymentMethod}</td>
                              </tr>
                              <tr>
                                <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; border-top: 1px dashed #e2e8f0;">Transaction Date:</td>
                                <td style="padding: 7px 0; font-size: 13px; color: #0f172a; font-weight: 600; text-align: right; border-top: 1px dashed #e2e8f0;">${data.paidAt}</td>
                              </tr>
                              <tr>
                                <td style="padding: 14px 0 0 0; font-size: 16px; color: #0c6f78; font-weight: 800; border-top: 2px solid #0c6f78;">Total Paid:</td>
                                <td style="padding: 14px 0 0 0; font-size: 20px; color: #16a34a; font-weight: 900; text-align: right; border-top: 2px solid #0c6f78;">${formattedPrice}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 14px; font-size: 12px; color: #0f766e; line-height: 1.5;">
                        <strong>Health Record / Insurance Notice:</strong> This email serves as an official confirmation of physical therapy services rendered. Please preserve this record for your medical tax deductions or health insurance reimbursement claims.
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #072b31; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                      <p style="margin: 0 0 4px 0; color: #ffffff; font-weight: 700;">${data.clinicName}</p>
                      <p style="margin: 0;">${data.clinicAddress} | Phone: ${data.clinicPhone}</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Payment receipt email dispatched:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error: (error as any).message };
  }
}