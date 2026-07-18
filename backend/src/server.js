import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

import { startSimulation } from './utils/mockDb.js';

// Boot interceptors for offline simulation support
startSimulation();

// Connect to MongoDB Database
connectDB();

// Start Express Server Listener
const server = app.listen(PORT, () => {
  console.log(`ResumeForge AI Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
