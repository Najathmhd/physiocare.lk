const mongoose = require('mongoose');
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

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test basic operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // Test queries
    const appointmentCount = await db.collection('appointments').countDocuments();
    console.log(`📅 Appointments in database: ${appointmentCount}`);
    
    const patientCount = await db.collection('patients').countDocuments();
    console.log(`👥 Patients in database: ${patientCount}`);
    
    const serviceCount = await db.collection('services').countDocuments();
    console.log(`🏥 Services in database: ${serviceCount}`);
    
    const staffCount = await db.collection('staffs').countDocuments();
    console.log(`👨‍⚕️ Staff in database: ${staffCount}`);
    
    const settingsCount = await db.collection('settings').countDocuments();
    console.log(`⚙️ Settings in database: ${settingsCount}`);
    
    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Please check your MongoDB connection string and ensure MongoDB is running.');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testConnection(); 