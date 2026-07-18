import express from 'express';
import Profile from '../models/Profile.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validator.js';
import { profileSchema } from '../validators/schemas.js';

const router = express.Router();

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await Profile.create({
        user: req.user._id,
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        languages: [],
        achievements: []
      });
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
});

// @desc    Create or update user profile
// @route   PUT /api/profile
// @access  Private
router.put('/', protect, validate(profileSchema), async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new Profile({ user: req.user._id, ...req.body });
    } else {
      Object.assign(profile, req.body);
    }
    profile.updatedAt = Date.now();
    await profile.save();

    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
});

export default router;
