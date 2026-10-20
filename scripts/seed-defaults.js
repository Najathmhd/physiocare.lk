const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch (e) {}

const MONGODB_URI = process.env.MONGODB_URI;

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, default: 30 },
  price: { type: Number, default: 0 },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  specialization: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  hireDate: { type: String, required: true },
}, { timestamps: true });

const ServiceModel = mongoose.model('Service', serviceSchema);
const StaffModel = mongoose.model('Staff', staffSchema);

async function seedDefaults() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const serviceCount = await ServiceModel.countDocuments();
    if (serviceCount === 0) {
      console.log('Seeding default services...');
      await ServiceModel.insertMany([
        {
          name: 'Physical Therapy',
          description: 'Comprehensive physical therapy for injury recovery and rehabilitation.',
          duration: 60,
          price: 120,
          category: 'Physical Therapy',
          isActive: true
        },
        {
          name: 'Sports Rehabilitation',
          description: 'Specialized therapy for athletic injuries and peak physical performance.',
          duration: 45,
          price: 100,
          category: 'Sports Medicine',
          isActive: true
        },
        {
          name: 'Manual Massage Therapy',
          description: 'Deep tissue and therapeutic massage for pain relief and tension reduction.',
          duration: 30,
          price: 80,
          category: 'Massage Therapy',
          isActive: true
        },
        {
          name: 'Neurological Rehabilitation',
          description: 'Specialized neurological care for stroke, neuropathy, and nerve restoration.',
          duration: 60,
          price: 150,
          category: 'Neurological',
          isActive: true
        },
        {
          name: 'Orthopedic Spine & Joint Care',
          description: 'Targeted assessment and treatment for chronic neck, back, and joint pains.',
          duration: 45,
          price: 110,
          category: 'Orthopedic',
          isActive: true
        }
      ]);
      console.log('Services seeded successfully!');
    } else {
      console.log(`Services already present: ${serviceCount}`);
    }

    const staffCount = await StaffModel.countDocuments();
    if (staffCount === 0) {
      console.log('Seeding default staff...');
      const hashedPassword = await bcrypt.hash('staff123', 10);
      await StaffModel.insertMany([
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@physiocare.com',
          phone: '+94 77 123 4567',
          role: 'Lead Physiotherapist',
          specialization: 'Orthopedics & Spine Care',
          licenseNumber: 'SL-PT-10042',
          isActive: true,
          hireDate: '2022-01-15'
        },
        {
          name: 'Dr. Michael Chen',
          email: 'michael.chen@physiocare.com',
          phone: '+94 77 234 5678',
          role: 'Sports Physiotherapist',
          specialization: 'Sports Injuries & Rehab',
          licenseNumber: 'SL-PT-10088',
          isActive: true,
          hireDate: '2023-04-10'
        },
        {
          name: 'Kavindi Perera',
          email: 'kavindi.perera@physiocare.com',
          phone: '+94 77 345 6789',
          role: 'Rehabilitation Specialist',
          specialization: 'Neurological & Geriatric Care',
          licenseNumber: 'SL-PT-10115',
          isActive: true,
          hireDate: '2023-09-01'
        }
      ]);
      console.log('Staff members seeded successfully!');
    } else {
      console.log(`Staff already present: ${staffCount}`);
    }
  } catch (error) {
    console.error('Error seeding defaults:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDefaults();
