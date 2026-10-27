const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/triptide_db');
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Make sure MongoDB service is running on 127.0.0.1:27017 or verify your MONGODB_URI in backend/.env');
    // Don't exit immediately so API can still report health status to frontend
    return null;
  }
};

module.exports = connectDB;
