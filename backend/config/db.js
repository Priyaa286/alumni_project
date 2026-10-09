const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nec-alumni';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[DB Notice] MongoDB connection attempt (${error.message}). Server operating with active in-memory data store.`);
  }
};

module.exports = connectDB;
