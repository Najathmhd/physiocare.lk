const mongoose = require('mongoose');
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

async function updateLKR() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Update Services
    await db.collection('services').updateOne(
      { name: { $regex: /Physical Therapy/i } },
      { $set: { price: 4500, image: '/images/services/physical-therapy.jpg' } }
    );

    await db.collection('services').updateOne(
      { name: { $regex: /Sports Rehab/i } },
      { $set: { price: 4000, image: '/images/services/sports-rehab.jpg' } }
    );

    await db.collection('services').updateOne(
      { name: { $regex: /Massage/i } },
      { $set: { price: 3500, image: '/images/services/manual-massage.jpg' } }
    );

    await db.collection('services').updateOne(
      { name: { $regex: /Neuro/i } },
      { $set: { price: 5000, image: '/images/services/neuro-rehab.jpg' } }
    );

    await db.collection('services').updateOne(
      { name: { $regex: /Orthopedic/i } },
      { $set: { price: 4500, image: '/images/services/orthopedic-spine.jpg' } }
    );

    // Update any appointments that had old $100/$120 price to LKR
    await db.collection('appointments').updateMany(
      { paymentAmount: { $lt: 1000 } },
      { $set: { paymentAmount: 4500 } }
    );

    console.log('Successfully updated services and appointments to LKR and linked clinical images!');
  } catch (err) {
    console.error('Update error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Done');
  }
}

updateLKR();
