import express from 'express';
import Resume from '../models/Resume.js';
import ATSReport from '../models/ATSReport.js';
import { protect } from '../middlewares/auth.js';
import { geminiService } from '../services/geminiService.js';

const router = express.Router();

// Helper to run a local analytical scan of resume content
const runLocalATSScan = (resume, targetRole = 'Software Engineer') => {
  const formattingIssues = [];
  const weakBulletPoints = [];
  const duplicateSkills = [];
  
  let formatting = 85;
  let keywords = 60;
  let readability = 75;
  let experienceScore = 70;
  let projectsScore = 75;
  let skillsScore = 80;
  let educationScore = 80;
  let grammar = 90;

  // Basic structure check
  if (!resume.personalInfo?.phone || !resume.personalInfo?.email) {
    formatting -= 15;
    formattingIssues.push('Missing crucial contact details (phone number or email address) in header.');
  }
  if (!resume.summary) {
    readability -= 10;
    formattingIssues.push('Professional Summary section is blank or missing.');
  } else if (resume.summary.length > 500) {
    readability -= 15;
    formattingIssues.push('Professional Summary is too long. Keep it under 4 sentences.');
  }

  // Experience validation
  if (!resume.experience || resume.experience.length === 0) {
    experienceScore = 30;
    formattingIssues.push('No work experiences listed on resume.');
  } else {
    resume.experience.forEach(exp => {
      if (!exp.description || exp.description.length < 2) {
        experienceScore -= 10;
        weakBulletPoints.push({
          section: 'Experience',
          original: `${exp.role} at ${exp.company}`,
          suggestion: 'Detail your daily work responsibilities and key achievements with at least 3 STAR-format bullet points.'
        });
      } else {
        // Inspect bullets for weak verbs or action metrics
        exp.description.forEach(bullet => {
          if (!/\b(spearheaded|optimized|engineered|redesigned|led|developed|refactored)\b/i.test(bullet)) {
            weakBulletPoints.push({
              section: 'Experience',
              original: bullet,
              suggestion: 'Begin bullet points with dynamic action verbs (e.g., Spearheaded, Optimized, Refactored) instead of passive descriptions.'
            });
          }
          if (!/\b\d+%\b|\b\$\d+|\bhours\b/i.test(bullet)) {
            weakBulletPoints.push({
              section: 'Experience',
              original: bullet,
              suggestion: 'Quantify your contribution impact by adding specific metrics (e.g., performance gains %, latency reduced ms).'
            });
          }
        });
      }
    });
  }

  // Skills inspection
  if (!resume.skills || resume.skills.length === 0) {
    skillsScore = 30;
  } else {
    // Look for duplicates
    const seen = new Set();
    resume.skills.forEach(s => {
      const lower = s.toLowerCase().trim();
      if (seen.has(lower)) {
        duplicateSkills.push(s);
      } else {
        seen.add(lower);
      }
    });
    if (duplicateSkills.length > 0) {
      skillsScore -= 10;
    }
  }

  // Mock list of missing role keywords
  const requiredKeywords = ['System Design', 'CI/CD Pipelines', 'REST APIs', 'Unit Testing', 'Relational Databases'];
  const missingKeywords = requiredKeywords.filter(k => 
    !resume.skills.map(s => s.toLowerCase()).includes(k.toLowerCase())
  );
  keywords = Math.max(30, 100 - (missingKeywords.length * 12));

  // Average overall ATS Score
  const overallScore = Math.round(
    (formatting + keywords + readability + experienceScore + projectsScore + skillsScore + educationScore + grammar) / 8
  );

  return {
    overallScore,
    sectionScores: {
      formatting,
      keywords,
      readability,
      experience: experienceScore,
      projects: projectsScore,
      skills: skillsScore,
      education: educationScore,
      grammar
    },
    missingKeywords,
    weakBulletPoints,
    formattingIssues,
    duplicateSkills
  };
};

// @desc    Scan resume and return detailed ATS Score Report
// @route   POST /api/ats/scan/:resumeId
// @access  Private
router.post('/scan/:resumeId', protect, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const { jobDescriptionText } = req.body;
    let reportData;

    if (jobDescriptionText) {
      // If job description is provided, use Gemini to analyze compatibility
      const aiAnalysis = await geminiService.analyzeJobDescription(resume, jobDescriptionText);
      
      reportData = {
        overallScore: aiAnalysis.matchPercentage || 70,
        sectionScores: {
          formatting: 85,
          keywords: aiAnalysis.matchPercentage ? Math.round(aiAnalysis.matchPercentage * 0.9) : 70,
          readability: 80,
          experience: 75,
          projects: 80,
          skills: 85,
          education: 90,
          grammar: 95
        },
        missingKeywords: aiAnalysis.missingKeywords || [],
        weakBulletPoints: (aiAnalysis.weakBullets || []).map((wb, index) => ({
          section: 'General',
          original: wb,
          suggestion: aiAnalysis.optimizedBullets?.[index] || 'Rewrite for impact.'
        })),
        formattingSuggestions: aiAnalysis.formattingSuggestions || [],
        duplicateSkills: []
      };
    } else {
      // Fallback to local heuristic scanner
      reportData = runLocalATSScan(resume, resume.targetRole);
    }

    const report = await ATSReport.create({
      user: req.user._id,
      resume: resume._id,
      overallScore: reportData.overallScore,
      sectionScores: reportData.sectionScores,
      missingKeywords: reportData.missingKeywords,
      weakBulletPoints: reportData.weakBulletPoints,
      formattingIssues: reportData.formattingSuggestions || reportData.formattingIssues,
      duplicateSkills: reportData.duplicateSkills
    });

    res.status(200).json({ success: true, report });
  } catch (err) {
    next(err);
  }
});

// @desc    Compare two resumes
// @route   POST /api/ats/compare
// @access  Private
router.post('/compare', protect, async (req, res, next) => {
  const { resumeIdA, resumeIdB } = req.body;

  try {
    const resumeA = await Resume.findOne({ _id: resumeIdA, user: req.user._id });
    const resumeB = await Resume.findOne({ _id: resumeIdB, user: req.user._id });

    if (!resumeA || !resumeB) {
      return res.status(404).json({ success: false, error: 'One or both resumes not found' });
    }

    const comparison = await geminiService.compareResumes(resumeA, resumeB);

    res.status(200).json({
      success: true,
      comparison: {
        scoreDifference: comparison.scoreDifference,
        strengthsA: comparison.strengthsA,
        strengthsB: comparison.strengthsB,
        weaknessesA: comparison.weaknessesA,
        weaknessesB: comparison.weaknessesB,
        recommendation: comparison.recommendation,
        resumeAName: resumeA.title,
        resumeBName: resumeB.title,
        resumeAScore: resumeA.atsScore,
        resumeBScore: resumeB.atsScore
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
