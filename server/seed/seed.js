// Run with:  npm run seed   (wipes and re-inserts demo cars)
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Car = require('../models/Car');
const cars = require('./cars.data');

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await Car.deleteMany({});
    for (const c of cars) await Car.create(c); // create() so slugs are generated
    console.log(`🌱 Seeded ${cars.length} cars`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
