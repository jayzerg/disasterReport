import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from '../models/Report';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_reports');
    console.log('MongoDB connected successfully');
    
    // Create indexes
    await Report.createIndexes();
    console.log('Indexes created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

connectDB();