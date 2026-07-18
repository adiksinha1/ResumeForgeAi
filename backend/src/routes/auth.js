import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import validate from '../middlewares/validator.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'resumeforge_dev_secret_key_44332211', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validate(registerSchema), async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationToken: Math.random().toString(36).substring(2, 15)
    });

    // Create empty profile linked to user
    await Profile.create({
      user: user._id,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      languages: [],
      achievements: []
    });

    console.log(`[Verification Required] Token for ${email}: ${user.verificationToken}`);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validate(loginSchema), async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private (Needs JWT)
import { protect } from '../middlewares/auth.js';
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

// @desc    Email Verification
// @route   GET /api/auth/verify/:token
// @access  Public
router.get('/verify/:token', async (req, res, next) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (err) {
    next(err);
  }
});

// @desc    Demo Login (Instantly bypasses Auth setup with structured seeds)
// @route   POST /api/auth/demo-login
// @access  Public
router.post('/demo-login', async (req, res, next) => {
  const demoEmail = 'demo@resumeforge.ai';
  try {
    let user = await User.findOne({ email: demoEmail });
    if (!user) {
      user = await User.create({
        name: 'Alex Mercer',
        email: demoEmail,
        password: 'demopassword123',
        isVerified: true,
        role: 'user'
      });

      // Create a rich profile for the demo user
      await Profile.create({
        user: user._id,
        phone: '+1 (555) 019-2834',
        address: 'San Francisco, CA',
        portfolioUrl: 'https://alexmercer.dev',
        githubUsername: 'alexmercer',
        linkedinUrl: 'https://linkedin.com/in/alex-mercer',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Redis', 'TypeScript', 'Docker', 'AWS', 'Jest', 'Tailwind CSS'],
        experience: [
          {
            company: 'Stripe',
            role: 'Software Engineer II',
            location: 'San Francisco, CA',
            startDate: '2024-03',
            endDate: '',
            current: true,
            description: [
              'Developed and optimized developer dashboard components using React and TypeScript, increasing user interaction speed by 35%.',
              'Refactored checkout API endpoints, reducing median latency by 120ms through intelligent Redis caching strategies.',
              'Collaborated with product designers to implement responsive, pixel-perfect layouts matching Vercel/Stripe aesthetics.'
            ]
          },
          {
            company: 'Vercel',
            role: 'Junior Frontend Developer',
            location: 'Remote',
            startDate: '2022-06',
            endDate: '2024-02',
            current: false,
            description: [
              'Shipped modular dashboard cards and components integrated with Next.js router configurations.',
              'Wrote over 40+ unit and integration tests with Jest and Testing Library, increasing test coverage from 72% to 94%.',
              'Implemented smooth layout transition animations utilizing Framer Motion, enhancing user satisfaction ratings.'
            ]
          }
        ],
        education: [
          {
            school: 'Stanford University',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2018-09',
            endDate: '2022-06',
            cgpa: '3.92',
            current: false
          }
        ],
        projects: [
          {
            title: 'ResumeForge AI Builder',
            description: 'A full-stack, state-of-the-art resume builder platform that analyzes and scores ATS optimization levels in real time.',
            technologies: ['React', 'Redux', 'Tailwind CSS', 'Node.js', 'MongoDB', 'Gemini API'],
            githubUrl: 'https://github.com/alexmercer/resumeforge',
            liveUrl: 'https://resumeforge.ai',
            achievements: [
              'Engineered custom parsing engine using Puppeteer to generate high-quality PDF templates in milliseconds.',
              'Designed a live ATS score meter showing score feedback in real time with interactive suggestions.'
            ]
          }
        ],
        certifications: [
          { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2025-01', url: 'https://aws.amazon.com' }
        ],
        languages: [{ language: 'English', proficiency: 'Native' }, { language: 'Spanish', proficiency: 'Conversational' }],
        achievements: [
          'First place at Stanford Hackathon 2021 for AI-powered education assistant.',
          'Open-source contributor to major React and Next.js libraries with over 500+ stars combined.'
        ]
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

export default router;
