import _colors from 'colors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const connectDB = async () => {
  const dbName = process.env.DB_URL;
  try {
    await mongoose.connect(dbName);

    console.log('\n==============================='.green);
    console.log('✅ SUCCESS:'.bold + ' Connected to DB'.green);
    console.log('📦 Database:'.bold + ` ${dbName}`.cyan);
    console.log('==============================='.green);
  } catch (err) {
    console.log('\n==============================='.red);
    console.log('❌ ERROR:'.bold + ' Failed to connect to DB'.red);
    console.log(`📄 ${err.message}`.yellow);
    console.log('==============================='.red);
  }
};

export default connectDB;
