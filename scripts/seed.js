const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Auto-load .env.local without external dependencies
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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/physio-care';

// Define schemas inline since we can't import TypeScript models directly
const appointmentSchema = new mongoose.Schema({
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
  notes: { type: String },
}, { timestamps: true });

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  medicalHistory: { type: String },
  emergencyContact: { type: String },
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

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'admin' },
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, default: 30 },
  price: { type: Number, default: 0 },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const settingsSchema = new mongoose.Schema({
  clinicName: { type: String, required: true },
  clinicAddress: { type: String, required: true },
  clinicPhone: { type: String, required: true },
  clinicEmail: { type: String, required: true },
  clinicWebsite: { type: String },
  businessHours: { type: Object, default: {} },
  appointmentSettings: { type: Object, default: {} },
  notificationSettings: { type: Object, default: {} },
}, { timestamps: true });

// Create models
const AppointmentModel = mongoose.model('Appointment', appointmentSchema);
const PatientModel = mongoose.model('Patient', patientSchema);
const StaffModel = mongoose.model('Staff', staffSchema);
const UserModel = mongoose.model('User', userSchema);
const ServiceModel = mongoose.model('Service', serviceSchema);
const SettingsModel = mongoose.model('Settings', settingsSchema);

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      AppointmentModel.deleteMany({}),
      PatientModel.deleteMany({}),
      ServiceModel.deleteMany({}),
      StaffModel.deleteMany({}),
      SettingsModel.deleteMany({}),
      UserModel.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Seed Services
    const services = await ServiceModel.insertMany([
      {
        name: 'Clinic Visit',
        description: 'Comprehensive in-clinic physiotherapy, clinical assessment, and targeted rehabilitation utilizing professional clinic facilities at Warakapola.',
        duration: 45,
        price: 3500,
        category: 'Clinic Consultation',
        image: '/images/services/physical-therapy.jpg',
        isActive: true
      },
      {
        name: 'Home Visit',
        description: 'Personalized bedside and home-based physiotherapy care delivered directly to your residence, ideal for post-surgery, elderly, and mobility-restricted patients.',
        duration: 60,
        price: 5000,
        category: 'Bedside & Home Care',
        image: '/images/clinical-care.jpg',
        isActive: true
      }
    ]);
    console.log('Seeded services');

    // Seed Staff
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const staff = await StaffModel.insertMany([
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@physiocare.com',
        phone: '+1 (555) 123-4567',
        role: 'Senior Physiotherapist',
        specialization: 'Orthopedic',
        licenseNumber: 'PT-001234',
        isActive: true,
        hireDate: '2020-01-15',
        password: hashedPassword
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@physiocare.com',
        phone: '+1 (555) 123-4568',
        role: 'Physiotherapist',
        specialization: 'Sports Medicine',
        licenseNumber: 'PT-001235',
        isActive: true,
        hireDate: '2021-03-20',
        password: hashedPassword
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@physiocare.com',
        phone: '+1 (555) 123-4569',
        role: 'Physical Therapist',
        specialization: 'Neurological',
        licenseNumber: 'PT-001236',
        isActive: true,
        hireDate: '2019-08-10',
        password: hashedPassword
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@physiocare.com',
        phone: '+1 (555) 123-4570',
        role: 'Rehabilitation Specialist',
        specialization: 'Cardiovascular',
        licenseNumber: 'PT-001237',
        isActive: true,
        hireDate: '2022-01-05',
        password: hashedPassword
      },
      {
        name: 'Lisa Thompson',
        email: 'lisa.thompson@physiocare.com',
        phone: '+1 (555) 123-4571',
        role: 'Massage Therapist',
        specialization: 'General',
        licenseNumber: 'MT-001001',
        isActive: true,
        hireDate: '2021-06-15',
        password: hashedPassword
      }
    ]);
    console.log('Seeded staff');

    // Seed Admin User
    await UserModel.create({
      name: 'Physio Care Admin',
      email: 'azrinphysiocare@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Seeded admin user');

    // Seed Patients
    const patients = await PatientModel.insertMany([
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 987-6543',
        dateOfBirth: '1985-03-15',
        gender: 'male',
        address: '123 Main Street, City, State 12345',
        medicalHistory: 'Previous knee surgery in 2020',
        emergencyContact: '+1 (555) 987-6544'
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '+1 (555) 987-6545',
        dateOfBirth: '1990-07-22',
        gender: 'female',
        address: '456 Oak Avenue, City, State 12345',
        medicalHistory: 'Lower back pain, no previous surgeries',
        emergencyContact: '+1 (555) 987-6546'
      },
      {
        name: 'Robert Johnson',
        email: 'robert.johnson@email.com',
        phone: '+1 (555) 987-6547',
        dateOfBirth: '1978-11-08',
        gender: 'male',
        address: '789 Pine Road, City, State 12345',
        medicalHistory: 'Sports injury history, shoulder dislocation',
        emergencyContact: '+1 (555) 987-6548'
      },
      {
        name: 'Jennifer Davis',
        email: 'jennifer.davis@email.com',
        phone: '+1 (555) 987-6549',
        dateOfBirth: '1992-04-30',
        gender: 'female',
        address: '321 Elm Street, City, State 12345',
        medicalHistory: 'Post-surgery rehabilitation needed',
        emergencyContact: '+1 (555) 987-6550'
      },
      {
        name: 'David Brown',
        email: 'david.brown@email.com',
        phone: '+1 (555) 987-6551',
        dateOfBirth: '1982-09-12',
        gender: 'male',
        address: '654 Maple Drive, City, State 12345',
        medicalHistory: 'Chronic neck pain, car accident history',
        emergencyContact: '+1 (555) 987-6552'
      }
    ]);
    console.log('Seeded patients');

    // Seed Appointments
    const appointments = await AppointmentModel.insertMany([
      {
        patientName: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 987-6543',
        service: 'Physical Therapy',
        date: '2024-01-15',
        time: '10:00',
        status: 'confirmed',
        notes: 'Follow-up appointment for knee rehabilitation'
      },
      {
        patientName: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '+1 (555) 987-6545',
        service: 'Massage Therapy',
        date: '2024-01-16',
        time: '14:30',
        status: 'pending',
        notes: 'Lower back pain relief session'
      },
      {
        patientName: 'Robert Johnson',
        email: 'robert.johnson@email.com',
        phone: '+1 (555) 987-6547',
        service: 'Sports Rehabilitation',
        date: '2024-01-17',
        time: '09:00',
        status: 'confirmed',
        notes: 'Shoulder rehabilitation program'
      },
      {
        patientName: 'Jennifer Davis',
        email: 'jennifer.davis@email.com',
        phone: '+1 (555) 987-6549',
        service: 'Physical Therapy',
        date: '2024-01-18',
        time: '11:00',
        status: 'completed',
        notes: 'Post-surgery recovery session'
      },
      {
        patientName: 'David Brown',
        email: 'david.brown@email.com',
        phone: '+1 (555) 987-6551',
        service: 'Neurological Therapy',
        date: '2024-01-19',
        time: '15:00',
        status: 'pending',
        notes: 'Neck pain assessment and treatment'
      }
    ]);
    console.log('Seeded appointments');

    // Seed Settings
    const settings = await SettingsModel.create({
      clinicName: 'Physio Care',
      clinicAddress: '49, Masjid Mawatha, Warakapola, Sri Lanka',
      clinicPhone: '+94 77 337 8718',
      clinicEmail: 'azrinphysiocare@gmail.com',
      clinicWebsite: 'https://physiocare.com',
      businessHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '15:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true }
      },
      appointmentSettings: {
        slotDuration: 30,
        maxAppointmentsPerDay: 20,
        advanceBookingDays: 30,
        cancellationHours: 24
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        reminderHours: 24
      }
    });
    console.log('Seeded settings');

    console.log('Database seeded successfully!');
    console.log(`Created ${services.length} services`);
    console.log(`Created ${staff.length} staff members`);
    console.log(`Created ${patients.length} patients`);
    console.log(`Created ${appointments.length} appointments`);
    console.log('Created 1 settings record');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase(); 