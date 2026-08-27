const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nec-alumni';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
<<<<<<< HEAD
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[DB Warning] Could not connect to MongoDB (${error.message}).`);
=======
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[DB Notice] MongoDB connection error (${error.message}). Server operating with active in-memory data store.`);
>>>>>>> 3b1412bd6bfb564cfa5c1c45d7d1575d28e4f7db
  }
};

module.exports = connectDB;
