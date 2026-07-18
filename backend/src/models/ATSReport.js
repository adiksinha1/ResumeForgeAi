import mongoose from 'mongoose';

const ATSReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  overallScore: {
    type: Number,
    required: true
  },
  sectionScores: {
    formatting: Number,
    keywords: Number,
    readability: Number,
    experience: Number,
    projects: Number,
    skills: Number,
    education: Number,
    grammar: Number
  },
  missingKeywords: [String],
  weakBulletPoints: [{
    section: String,
    original: String,
    suggestion: String
  }],
  formattingIssues: [String],
  duplicateSkills: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ATSReport = mongoose.model('ATSReport', ATSReportSchema);
export default ATSReport;
