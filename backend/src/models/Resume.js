import mongoose from 'mongoose';

const SectionVisibilitySchema = new mongoose.Schema({
  summary: { type: Boolean, default: true },
  experience: { type: Boolean, default: true },
  education: { type: Boolean, default: true },
  projects: { type: Boolean, default: true },
  skills: { type: Boolean, default: true },
  certifications: { type: Boolean, default: true },
  languages: { type: Boolean, default: true },
  achievements: { type: Boolean, default: true }
}, { _id: false });

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'My Resume'
  },
  targetRole: {
    type: String,
    default: 'Software Engineer'
  },
  templateId: {
    type: String,
    default: 'modern_minimal'
  },
  styling: {
    fontFamily: { type: String, default: 'Inter' },
    primaryColor: { type: String, default: '#0f172a' },
    secondaryColor: { type: String, default: '#475569' },
    textColor: { type: String, default: '#334155' },
    backgroundColor: { type: String, default: '#ffffff' },
    margin: { type: String, default: 'comfortable' }, // compact, comfortable, loose
    spacing: { type: String, default: 'normal' }, // compact, normal, loose
    pageSize: { type: String, default: 'A4' } // A4, Letter
  },
  sectionOrder: {
    type: [String],
    default: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'languages', 'achievements']
  },
  sectionVisibility: {
    type: SectionVisibilitySchema,
    default: () => ({})
  },
  // Deep snapshot of resume data so modifying resume doesn't alter general profile
  personalInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
    portfolioUrl: String,
    githubUsername: String,
    linkedinUrl: String
  },
  summary: { type: String, default: '' },
  experience: [{
    company: String,
    role: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: [String]
  }],
  education: [{
    school: String,
    degree: String,
    fieldOfStudy: String,
    startDate: String,
    endDate: String,
    cgpa: String,
    coursework: String,
    current: Boolean
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    githubUrl: String,
    liveUrl: String,
    achievements: [String]
  }],
  skills: [String],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    url: String
  }],
  languages: [{
    language: String,
    proficiency: String
  }],
  achievements: [String],
  atsScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ResumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Resume = mongoose.model('Resume', ResumeSchema);
export default Resume;
