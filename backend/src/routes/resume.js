import express from 'express';
import Resume from '../models/Resume.js';
import Profile from '../models/Profile.js';
import ResumeVersion from '../models/ResumeVersion.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validator.js';
import { resumeSchema } from '../validators/schemas.js';
import { generatePDF } from '../utils/pdfGenerator.js';
import { generateDOCX } from '../utils/docxGenerator.js';

const router = express.Router();

// Helper to compute a basic local ATS score dynamically
const calculateLocalATSScore = (resume) => {
  let score = 30; // base score for basic info
  if (resume.summary && resume.summary.length > 50) score += 10;
  if (resume.experience && resume.experience.length > 0) score += 20;
  if (resume.education && resume.education.length > 0) score += 15;
  if (resume.projects && resume.projects.length > 0) score += 15;
  if (resume.skills && resume.skills.length > 3) score += 10;
  return Math.min(score, 100);
};

// @desc    Get all resumes of user
// @route   GET /api/resumes
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, resumes });
  } catch (err) {
    next(err);
  }
});

// @desc    Create a new resume (optionally seeded from Master Profile)
// @route   POST /api/resumes
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    
    // Seed fields from master profile if it exists, otherwise use empty arrays
    const newResume = await Resume.create({
      user: req.user._id,
      title: req.body.title || 'Untitled Resume',
      targetRole: req.body.targetRole || 'Software Engineer',
      personalInfo: {
        name: req.user.name,
        email: req.user.email,
        phone: profile?.phone || '',
        address: profile?.address || '',
        portfolioUrl: profile?.portfolioUrl || '',
        githubUsername: profile?.githubUsername || '',
        linkedinUrl: profile?.linkedinUrl || ''
      },
      summary: profile?.summary || '',
      experience: profile?.experience || [],
      education: profile?.education || [],
      projects: profile?.projects || [],
      skills: profile?.skills || [],
      certifications: profile?.certifications || [],
      languages: profile?.languages || [],
      achievements: profile?.achievements || []
    });

    newResume.atsScore = calculateLocalATSScore(newResume);
    await newResume.save();

    // Create version 1
    await ResumeVersion.create({
      resume: newResume._id,
      versionNumber: 1,
      description: 'Initial creation',
      resumeData: newResume.toObject()
    });

    res.status(201).json({ success: true, resume: newResume });
  } catch (err) {
    next(err);
  }
});

// @desc    Get specific resume details
// @route   GET /api/resumes/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    res.status(200).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
});

// @desc    Update a resume and create a backup version
// @route   PUT /api/resumes/:id
// @access  Private
router.put('/:id', protect, validate(resumeSchema), async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    // Save history before modifying
    const latestVersion = await ResumeVersion.findOne({ resume: resume._id }).sort({ versionNumber: -1 });
    const nextVer = latestVersion ? latestVersion.versionNumber + 1 : 1;

    Object.assign(resume, req.body);
    resume.atsScore = calculateLocalATSScore(resume);
    await resume.save();

    // Create backup version history entry
    await ResumeVersion.create({
      resume: resume._id,
      versionNumber: nextVer,
      description: req.body.versionDescription || `Autosave version ${nextVer}`,
      resumeData: resume.toObject()
    });

    res.status(200).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    // Clean up versions associated with resume
    await ResumeVersion.deleteMany({ resume: req.params.id });
    res.status(200).json({ success: true, message: 'Resume deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// @desc    Duplicate resume
// @route   POST /api/resumes/:id/duplicate
// @access  Private
router.post('/:id/duplicate', protect, async (req, res, next) => {
  try {
    const origResume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!origResume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const dup = await Resume.create({
      user: req.user._id,
      title: `${origResume.title} (Copy)`,
      targetRole: origResume.targetRole,
      templateId: origResume.templateId,
      styling: origResume.styling,
      sectionOrder: origResume.sectionOrder,
      sectionVisibility: origResume.sectionVisibility,
      personalInfo: origResume.personalInfo,
      summary: origResume.summary,
      experience: origResume.experience,
      education: origResume.education,
      projects: origResume.projects,
      skills: origResume.skills,
      certifications: origResume.certifications,
      languages: origResume.languages,
      achievements: origResume.achievements,
      atsScore: origResume.atsScore
    });

    await ResumeVersion.create({
      resume: dup._id,
      versionNumber: 1,
      description: 'Duplicated creation',
      resumeData: dup.toObject()
    });

    res.status(201).json({ success: true, resume: dup });
  } catch (err) {
    next(err);
  }
});

// @desc    Get version history
// @route   GET /api/resumes/:id/versions
// @access  Private
router.get('/:id/versions', protect, async (req, res, next) => {
  try {
    const versions = await ResumeVersion.find({ resume: req.params.id }).sort({ versionNumber: -1 });
    res.status(200).json({ success: true, versions });
  } catch (err) {
    next(err);
  }
});

// @desc    Restore specific version
// @route   POST /api/resumes/:id/versions/:versionId/restore
// @access  Private
router.post('/:id/versions/:versionId/restore', protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const version = await ResumeVersion.findOne({ _id: req.params.versionId, resume: resume._id });
    if (!version) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }

    // Set properties back to version snapshot
    Object.assign(resume, version.resumeData);
    await resume.save();

    res.status(200).json({ success: true, resume, message: 'Resume version restored successfully' });
  } catch (err) {
    next(err);
  }
});

// @desc    Export resume PDF
// @route   GET /api/resumes/:id/pdf
// @access  Private
router.get('/:id/pdf', protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const pdfBuffer = await generatePDF(resume);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${resume.title.replace(/\s+/g, '_')}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

// @desc    Export resume DOCX
// @route   GET /api/resumes/:id/docx
// @access  Private
router.get('/:id/docx', protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const docxBuffer = generateDOCX(resume);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${resume.title.replace(/\s+/g, '_')}.docx"`,
      'Content-Length': docxBuffer.length
    });

    res.send(docxBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
