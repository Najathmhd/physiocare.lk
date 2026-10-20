import mongoose, { Schema, Document, models } from 'mongoose';

export interface IStaff extends Document {
  name: string;
  email: string;
  phone: string;
  role: string;
  specialization: string;
  licenseNumber: string;
  isActive: boolean;
  hireDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  specialization: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  hireDate: { type: String, required: true },
}, { timestamps: true });

// Ensure model recompilation in dev mode
if (models.Staff) {
  delete (mongoose.models as any).Staff;
}

export default mongoose.model<IStaff>('Staff', StaffSchema);