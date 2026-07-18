import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import Custom Middlewares
import { xssClean, mongoSanitizeMiddleware } from './middlewares/security.js';
import errorHandler from './middlewares/error.js';

// Import Route Handlers
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import resumeRoutes from './routes/resume.js';
import atsRoutes from './routes/ats.js';
import aiRoutes from './routes/ai.js';
import integrationsRoutes from './routes/integrations.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// 1. Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false // Allow dynamic fonts loading in previews
}));

// 2. Cross Origin Resource Sharing (CORS)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 3. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Request Sanitization (NoSQL injection and XSS scrubbing)
app.use(mongoSanitizeMiddleware());
app.use(xssClean);

// 5. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased threshold for local development & active typing
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false
});
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', limiter);
}

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ResumeForge AI Server is running.' });
});

// Debug request logging middleware
app.use((req, res, next) => {
  console.log(`[API REQUEST] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length) {
    console.log(`[API REQUEST BODY] ${JSON.stringify(req.body)}`);
  }
  next();
});

// 6. API Routing Connections
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/admin', adminRoutes);

// 7. Global Exception/Error Handling
app.use(errorHandler);

export default app;
