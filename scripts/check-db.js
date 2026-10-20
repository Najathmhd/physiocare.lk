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

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    console.log('Connection string:', MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Check collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // Check data in each collection
    const appointmentCount = await db.collection('appointments').countDocuments();
    const patientCount = await db.collection('patients').countDocuments();
    const serviceCount = await db.collection('services').countDocuments();
    const staffCount = await db.collection('staffs').countDocuments();
    const settingsCount = await db.collection('settings').countDocuments();
    const userCount = await db.collection('users').countDocuments();
    
    console.log('\n📈 Data Summary:');
    console.log(`- Appointments: ${appointmentCount}`);
    console.log(`- Patients: ${patientCount}`);
    console.log(`- Services: ${serviceCount}`);
    console.log(`- Staff: ${staffCount}`);
    console.log(`- Users/Admins: ${userCount}`);
    console.log(`- Settings: ${settingsCount}`);
    
    if (appointmentCount === 0 && patientCount === 0 && serviceCount === 0 && staffCount === 0) {
      console.log('\n⚠️  Database appears to be empty!');
      console.log('💡 Run "npm run seed" to populate with sample data.');
    } else {
      console.log('\n✅ Database has data!');
    }
    
    if (settingsCount === 0) {
      console.log('⚠️  No settings found! Default settings will be created when accessed.');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.log('\n💡 Possible solutions:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your MONGODB_URI environment variable');
    console.log('3. If using MongoDB Atlas, check your connection string');
    console.log('4. If using local MongoDB, make sure the service is started');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkDatabase(); 