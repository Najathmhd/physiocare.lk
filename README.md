# Physio Care - Complete Physiotherapy Management System

A modern, responsive web application for managing physiotherapy clinics, built with Next.js 15, TypeScript, Bootstrap 5, and MongoDB.

## Features

### Patient-Facing Features
- **Modern Landing Page**: Professional, responsive design with hero section, services overview, and about section
- **Online Appointment Booking**: Easy-to-use appointment booking form with service selection
- **Contact Information**: Clinic details and contact forms
- **Responsive Design**: Mobile-first approach ensuring great experience on all devices

### Admin Panel Features
- **Dashboard**: Real-time overview with appointment counts, patient statistics, and quick actions
- **Appointment Management**: Full CRUD operations for appointments with status tracking
- **Patient Management**: Comprehensive patient records with medical history
- **Staff Management**: Staff profiles with roles, specializations, and license tracking
- **Service Management**: Configurable services with pricing and duration
- **Settings Management**: Clinic configuration, business hours, and notification settings

### Technical Features
- **Full Database Integration**: All data persists in MongoDB
- **RESTful API**: Complete API endpoints for all operations
- **TypeScript**: Full type safety throughout the application
- **Responsive UI**: Bootstrap 5 with custom styling
- **Real-time Updates**: Live data updates across all admin pages
- **Search & Filtering**: Advanced search and filter capabilities
- **Form Validation**: Client and server-side validation
- **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Bootstrap 5, Font Awesome
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Styling**: Bootstrap 5, Custom CSS, AOS (Animate On Scroll)
- **Database**: MongoDB
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd physio-care
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/physio-care
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/physio-care
   ```

4. **Set up the database**
   ```bash
   # Run the seed script to populate with sample data
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `physio-care`

### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `.env.local` with your connection string

### Seed Data
The application comes with comprehensive seed data including:
- 6 different physiotherapy services
- 5 staff members with various roles
- 5 sample patients
- 5 sample appointments
- Default clinic settings

Run the seed script:
```bash
npm run seed
```

## Project Structure

```
physio-care/
├── src/
│   ├── app/                    # Next.js 15 app directory
│   │   ├── admin/             # Admin panel pages
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   ├── appointments/  # Appointment management
│   │   │   ├── patients/      # Patient management
│   │   │   ├── services/      # Service management
│   │   │   ├── staff/         # Staff management
│   │   │   └── settings/      # Clinic settings
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   ├── AdminLayout.tsx    # Admin layout wrapper
│   │   ├── AOSInitializer.tsx # Animation setup
│   │   └── BootstrapProvider.tsx # Bootstrap context
│   └── utils/                 # Utility functions
│       └── api.ts             # API utility functions
├── pages/
│   └── api/                   # API routes
│       ├── appointments/      # Appointment endpoints
│       ├── patients/          # Patient endpoints
│       ├── services/          # Service endpoints
│       ├── staff/             # Staff endpoints
│       └── settings/          # Settings endpoints
├── models/                    # MongoDB models
├── scripts/                   # Database scripts
└── public/                    # Static assets
```

## API Endpoints

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/[id]` - Get specific appointment
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Delete appointment

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get specific patient
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service
- `GET /api/services/[id]` - Get specific service
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service

### Staff
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create new staff member
- `GET /api/staff/[id]` - Get specific staff member
- `PUT /api/staff/[id]` - Update staff member
- `DELETE /api/staff/[id]` - Delete staff member

### Settings
- `GET /api/settings` - Get clinic settings
- `PUT /api/settings` - Update clinic settings

## Usage

### For Patients
1. Visit the landing page
2. Browse available services
3. Fill out the appointment booking form
4. Submit to request an appointment

### For Administrators
1. Access the admin panel
2. Use the dashboard for overview
3. Manage appointments, patients, staff, and services
4. Configure clinic settings

## Customization

### Styling
- Modify `src/app/globals.css` for custom styles
- Update Bootstrap variables in the CSS file
- Add custom components in `src/components/`

### Services
- Add new service categories in the Service model
- Update the appointment booking form options
- Modify service pricing and duration

### Business Hours
- Configure business hours in the settings page
- Update appointment availability logic
- Customize notification settings

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Set up environment variables
4. Configure MongoDB connection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0
- Initial release
- Complete admin panel
- Patient booking system
- Database integration
- Responsive design
- Full CRUD operations

"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AOSInitializer() {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);
  return null;
}
