const mongoose = require('mongoose');
require('dotenv').config();
const Nomination = require('./models/Nomination');

const test = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(uri);
    const approved = await Nomination.find({
      $or: [
        { verificationStatus: 'Approved' },
        { status: 'Approved' }
      ]
    }).lean();

    const all = await Nomination.find().lean();
    console.log('Total Nominations in DB:', all.length);
    console.log('Approved Nominations in DB:', approved.length);
    if (all.length > 0) {
      console.log('Sample Nomination:', JSON.stringify(all[0], null, 2));
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

test();
