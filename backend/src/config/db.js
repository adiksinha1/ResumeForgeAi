import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/resumeforge', {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message}. Please verify MONGO_URI in .env`);
    try {
      const { startSimulation } = await import('../utils/mockDb.js');
      startSimulation();
    } catch (simErr) {
      console.error('Failed to start mock db simulation:', simErr.message);
    }
  }
};

export default connectDB;
