import mongoose, { Schema, Document, models } from "mongoose";

export interface ISettings extends Document {
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  clinicWebsite: string;
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  appointmentSettings: {
    slotDuration: number;
    maxAppointmentsPerDay: number;
    advanceBookingDays: number;
    cancellationHours: number;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    reminderHours: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BusinessHourSchema = new Schema({
  open: { type: String, required: true },
  close: { type: String, required: true },
  closed: { type: Boolean, default: false }
});

const AppointmentSettingsSchema = new Schema({
  slotDuration: { type: Number, default: 30, min: 15, max: 120 },
  maxAppointmentsPerDay: { type: Number, default: 20, min: 1, max: 100 },
  advanceBookingDays: { type: Number, default: 30, min: 1, max: 365 },
  cancellationHours: { type: Number, default: 24, min: 1, max: 72 }
});

const NotificationSettingsSchema = new Schema({
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: true },
  reminderHours: { type: Number, default: 24, min: 1, max: 72 }
});

const SettingsSchema: Schema = new Schema(
  {
    clinicName: { type: String, required: true },
    clinicAddress: { type: String, required: true },
    clinicPhone: { type: String, required: true },
    clinicEmail: { type: String, required: true },
    clinicWebsite: { type: String },
    businessHours: {
      monday: BusinessHourSchema,
      tuesday: BusinessHourSchema,
      wednesday: BusinessHourSchema,
      thursday: BusinessHourSchema,
      friday: BusinessHourSchema,
      saturday: BusinessHourSchema,
      sunday: BusinessHourSchema
    },
    appointmentSettings: AppointmentSettingsSchema,
    notificationSettings: NotificationSettingsSchema
  },
  { timestamps: true }
);

export default models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema); 