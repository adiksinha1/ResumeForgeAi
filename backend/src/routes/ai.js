import express from 'express';
import Resume from '../models/Resume.js';
import CoverLetter from '../models/CoverLetter.js';
import { protect } from '../middlewares/auth.js';
import { geminiService } from '../services/geminiService.js';

const router = express.Router();

// @desc    Generate professional summary
// @route   POST /api/ai/summary
// @access  Private
router.post('/summary', protect, async (req, res, next) => {
  try {
    const { profileData } = req.body;
    const aiResponse = await geminiService.generateSummary(profileData);
    res.status(200).json({ success: true, summary: aiResponse.summary });
  } catch (err) {
    next(err);
  }
});

// @desc    Improve bullets
// @route   POST /api/ai/improve-bullets
// @access  Private
router.post('/improve-bullets', protect, async (req, res, next) => {
  try {
    const { bullets } = req.body;
    const aiResponse = await geminiService.improveBulletPoints(bullets);
    res.status(200).json({ success: true, bullets: aiResponse.bullets });
  } catch (err) {
    next(err);
  }
});

// @desc    Suggest skills
// @route   POST /api/ai/suggest-skills
// @access  Private
router.post('/suggest-skills', protect, async (req, res, next) => {
  try {
    const { profileData } = req.body;
    const aiResponse = await geminiService.suggestSkills(profileData);
    res.status(200).json({ success: true, skills: aiResponse.skills });
  } catch (err) {
    next(err);
  }
});

// @desc    Suggest certifications
// @route   POST /api/ai/suggest-certifications
// @access  Private
router.post('/suggest-certifications', protect, async (req, res, next) => {
  try {
    const { profileData } = req.body;
    const aiResponse = await geminiService.suggestCertifications(profileData);
    res.status(200).json({ success: true, certifications: aiResponse.certifications });
  } catch (err) {
    next(err);
  }
});

// @desc    Create and save cover letter
// @route   POST /api/ai/cover-letter
// @access  Private
router.post('/cover-letter', protect, async (req, res, next) => {
  const { companyName, roleName, resumeId, jobDescription } = req.body;

  try {
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume snapshot not found' });
    }

    const clData = await geminiService.createCoverLetter(companyName, roleName, resume, jobDescription || '');

    const coverLetter = await CoverLetter.create({
      user: req.user._id,
      resume: resume._id,
      companyName,
      roleName,
      subject: clData.subject,
      body: clData.body
    });

    res.status(201).json({ success: true, coverLetter });
  } catch (err) {
    next(err);
  }
});

// @desc    Get saved cover letters
// @route   GET /api/ai/cover-letters
// @access  Private
router.get('/cover-letters', protect, async (req, res, next) => {
  try {
    const coverLetters = await CoverLetter.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, coverLetters });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete cover letter
// @route   DELETE /api/ai/cover-letters/:id
// @access  Private
router.delete('/cover-letters/:id', protect, async (req, res, next) => {
  try {
    const cl = await CoverLetter.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!cl) {
      return res.status(404).json({ success: false, error: 'Cover letter not found' });
    }
    res.status(200).json({ success: true, message: 'Cover letter deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// @desc    Create career roadmap
// @route   POST /api/ai/career-roadmap
// @access  Private
router.post('/career-roadmap', protect, async (req, res, next) => {
  try {
    const { role, skills } = req.body;
    const aiResponse = await geminiService.createCareerRoadmap(role, skills || []);
    res.status(200).json({ success: true, roadmap: aiResponse.roadmap });
  } catch (err) {
    next(err);
  }
});

// @desc    Create interview preparation questions
// @route   POST /api/ai/interview-prep
// @access  Private
router.post('/interview-prep', protect, async (req, res, next) => {
  try {
    const { resumeId } = req.body;
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume snapshot not found' });
    }

    const questions = await geminiService.generateInterviewQuestions(resume);
    res.status(200).json({ success: true, questions });
  } catch (err) {
    next(err);
  }
});

// @desc    Chat career coach chatbot
// @route   POST /api/ai/chat
// @access  Private
router.post('/chat', protect, async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const coachResponse = await geminiService.chatCareerBot(history || [], message);
    res.status(200).json({
      success: true,
      response: coachResponse.response,
      suggestedActions: coachResponse.suggestedActions || []
    });
  } catch (err) {
    next(err);
  }
});

export default router;
