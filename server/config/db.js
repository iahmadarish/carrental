const mongoose = require('mongoose');

async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log(`✅ MongoDB connected → ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

module.exports = connectDB;
