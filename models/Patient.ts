import mongoose, { Schema, Document, models } from "mongoose";

export interface IPatient extends Document {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  medicalHistory?: string;
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other'], 
      required: true 
    },
    address: { type: String, required: true },
    medicalHistory: { type: String },
    emergencyContact: { type: String },
  },
  { timestamps: true }
);

export default models.Patient || mongoose.model<IPatient>("Patient", PatientSchema); 