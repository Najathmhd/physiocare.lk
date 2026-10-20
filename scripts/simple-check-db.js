const mongoose = require('mongoose');

// MongoDB connection string
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
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`- ${collection.name}: ${count} documents`);
    }
    
    if (collections.length === 0) {
      console.log('\n⚠️  Database appears to be empty!');
      console.log('💡 Run "npm run seed" to populate with sample data.');
    } else {
      console.log('\n✅ Database has data!');
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