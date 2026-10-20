import dbConnect from './db';
import Appointment from '../models/Appointment';
import Patient from '../models/Patient';
import Staff from '../models/Staff';
import Service from '../models/Service';
import Settings from '../models/Settings';
import User from '../models/User';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    await dbConnect();
    console.log('Connected to database');

    // Clear existing data
    await Appointment.deleteMany({});
    await Patient.deleteMany({});
    await Staff.deleteMany({});
    await Service.deleteMany({});
    await Settings.deleteMany({});
    await User.deleteMany({});

    // Create visit services matching Service model
    const services = await Service.create([
      {
        name: 'Clinic Visit',
        description: 'Comprehensive in-clinic physiotherapy, clinical assessment, and targeted rehabilitation utilizing professional clinic facilities at Warakapola.',
        duration: 45,
        price: 3500,
        category: 'Clinic Consultation',
        image: '/images/services/physical-therapy.jpg',
        isActive: true,
      },
      {
        name: 'Home Visit',
        description: 'Personalized bedside and home-based physiotherapy care delivered directly to your residence, ideal for post-surgery, elderly, and mobility-restricted patients.',
        duration: 60,
        price: 5000,
        category: 'Bedside & Home Care',
        image: '/images/clinical-care.jpg',
        isActive: true,
      },
    ]);

    // Create Admin User for authentication
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Physio Care Admin',
      email: 'azrinphysiocare@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });

    // Create sample staff matching Staff model
    const staff = await Staff.create([
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@physiocare.com',
        phone: '+1 (555) 123-4567',
        role: 'Senior Physiotherapist',
        specialization: 'Orthopedic',
        licenseNumber: 'PT-001234',
        isActive: true,
        hireDate: '2020-01-15',
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
      },
    ]);

    // Create sample patients matching Patient model
    const patients = await Patient.create([
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 987-6543',
        dateOfBirth: '1985-03-15',
        gender: 'male',
        address: '123 Main Street, City, State 12345',
        medicalHistory: 'Previous knee surgery in 2020',
        emergencyContact: '+1 (555) 987-6544',
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '+1 (555) 987-6545',
        dateOfBirth: '1990-07-22',
        gender: 'female',
        address: '456 Oak Avenue, City, State 12345',
        medicalHistory: 'Lower back pain, no previous surgeries',
        emergencyContact: '+1 (555) 987-6546',
      },
      {
        name: 'Robert Johnson',
        email: 'robert.johnson@email.com',
        phone: '+1 (555) 987-6547',
        dateOfBirth: '1978-11-08',
        gender: 'male',
        address: '789 Pine Road, City, State 12345',
        medicalHistory: 'Sports injury history, shoulder dislocation',
        emergencyContact: '+1 (555) 987-6548',
      },
    ]);

    // Create sample appointments matching Appointment model
    await Appointment.create([
      {
        patientName: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 987-6543',
        service: 'Physical Therapy',
        date: '2025-01-15',
        time: '10:00',
        status: 'confirmed',
        notes: 'Follow-up appointment for knee rehabilitation',
      },
      {
        patientName: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '+1 (555) 987-6545',
        service: 'Massage Therapy',
        date: '2025-01-16',
        time: '14:30',
        status: 'pending',
        notes: 'Lower back pain relief session',
      },
      {
        patientName: 'Robert Johnson',
        email: 'robert.johnson@email.com',
        phone: '+1 (555) 987-6547',
        service: 'Sports Rehabilitation',
        date: '2025-01-17',
        time: '09:00',
        status: 'confirmed',
        notes: 'Shoulder rehabilitation program',
      },
    ]);

    // Create default clinic settings matching Settings model
    await Settings.create({
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
        sunday: { open: '00:00', close: '00:00', closed: true },
      },
      appointmentSettings: {
        slotDuration: 30,
        maxAppointmentsPerDay: 20,
        advanceBookingDays: 30,
        cancellationHours: 24,
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        reminderHours: 24,
      },
    });

    console.log('Database seeded successfully!');
    console.log(`Created ${services.length} services`);
    console.log(`Created ${staff.length} staff members`);
    console.log(`Created ${patients.length} patients`);
    console.log('Created 3 appointments');
    console.log('Created admin user (azrinphysiocare@gmail.com)');
    console.log('Created clinic settings');

    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}