import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tarag';
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};
