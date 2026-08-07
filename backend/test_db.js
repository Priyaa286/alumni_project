const mongoose = require('mongoose');

async function testConn() {
  console.log('Testing 127.0.0.1...');
  try {
    const conn1 = await mongoose.connect('mongodb://127.0.0.1:27017/nec-alumni', { serverSelectionTimeoutMS: 3000 });
    console.log('Connected via 127.0.0.1:', conn1.connection.host);
    process.exit(0);
  } catch (err) {
    console.error('Failed 127.0.0.1:', err.message);
  }

  console.log('Testing localhost...');
  try {
    const conn2 = await mongoose.connect('mongodb://localhost:27017/nec-alumni', { serverSelectionTimeoutMS: 3000 });
    console.log('Connected via localhost:', conn2.connection.host);
    process.exit(0);
  } catch (err) {
    console.error('Failed localhost:', err.message);
    process.exit(1);
  }
}

testConn();
