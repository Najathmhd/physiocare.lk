import mongoose, { Schema, Document, models } from "mongoose";

export interface IService extends Document {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { 
      type: Number, 
      required: true, 
      default: 30,
      min: 15,
      max: 180
    },
    price: { 
      type: Number, 
      required: true, 
      default: 0,
      min: 0
    },
    category: { 
      type: String, 
      required: true
    },
    image: {
      type: String,
      default: ""
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
  },
  { timestamps: true }
);

if (models.Service) {
  delete (mongoose.models as any).Service;
}

export default mongoose.model<IService>("Service", ServiceSchema);