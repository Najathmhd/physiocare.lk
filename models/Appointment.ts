import mongoose, { Schema, Document, models } from "mongoose";

export interface IAppointment extends Document {
  patientName: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "partial" | "refunded";
  paymentAmount?: number;
  paymentMethod?: "cash" | "card" | "bank_transfer" | "online" | "insurance";
  paidAt?: Date;
  receiptNumber?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    patientName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    service: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "partial", "refunded"],
      default: "unpaid",
    },
    paymentAmount: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "online", "insurance"],
      default: "cash",
    },
    paidAt: { type: Date },
    receiptNumber: { type: String },
    address: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Delete cached model in dev mode to ensure schema updates are applied
if (models.Appointment) {
  delete (mongoose.models as any).Appointment;
}

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema);