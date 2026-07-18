import express from 'express';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import CoverLetter from '../models/CoverLetter.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// Apply protect & adminOnly middleware to all administrative endpoints
router.use(protect, adminOnly);

// @desc    Get dashboard metrics
// @route   GET /api/admin/stats
// @access  Admin
router.get('/stats', async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    const resumeCount = await Resume.countDocuments();
    const coverLetterCount = await CoverLetter.countDocuments();
    
    // Calculate average ATS Score
    const resumes = await Resume.find().select('atsScore');
    const averageATS = resumes.length > 0 
      ? Math.round(resumes.reduce((acc, r) => acc + (r.atsScore || 0), 0) / resumes.length)
      : 0;

    res.status(200).json({
      success: true,
      stats: {
        users: userCount,
        resumes: resumeCount,
        coverLetters: coverLetterCount,
        averageATS,
        databaseStatus: 'Healthy',
        redisStatus: process.env.REDIS_URL ? 'Connected' : 'Offline (In-memory fallback enabled)'
      }
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Admin
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot delete admin accounts' });
    }

    await User.findByIdAndDelete(req.params.id);
    await Resume.deleteMany({ user: req.params.id });
    await CoverLetter.deleteMany({ user: req.params.id });

    res.status(200).json({ success: true, message: 'User and all associated data deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// @desc    Get mock API usage logs
// @route   GET /api/admin/api-usage
// @access  Admin
router.get('/api-usage', async (req, res, next) => {
  try {
    // Generate usage logging statistics
    res.status(200).json({
      success: true,
      usage: {
        geminiTokensUsed: 142050,
        requestsCount: {
          summaries: 42,
          bulletPoints: 128,
          coverLetters: 35,
          atsScans: 88,
          chatbot: 254
        },
        monthlyData: [
          { month: 'Feb', requests: 120, tokens: 42000 },
          { month: 'Mar', requests: 210, tokens: 68000 },
          { month: 'Apr', requests: 340, tokens: 105000 },
          { month: 'May', requests: 480, tokens: 142050 }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
