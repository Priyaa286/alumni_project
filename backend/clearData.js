const mongoose = require('mongoose');
require('dotenv').config();

const Nomination = require('./models/Nomination');
const Counter = require('./models/Counter');

const clearDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('Connecting to MongoDB database at:', uri);
    await mongoose.connect(uri);
    console.log('Connected successfully!');

    const nomResult = await Nomination.deleteMany({});
    console.log(`✅ Deleted ${nomResult.deletedCount} nomination records from database.`);

    const countResult = await Counter.deleteMany({});
    console.log(`✅ Reset ${countResult.deletedCount} counter records from database.`);

    console.log('🎉 All nomination data removed completely from database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing database:', err);
    process.exit(1);
  }
};

clearDatabase();
