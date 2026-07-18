import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: String,
  startDate: { type: String, required: true },
  endDate: String,
  current: { type: Boolean, default: false },
  description: [String] // STAR bullet points
});

const EducationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: String,
  startDate: { type: String, required: true },
  endDate: String,
  cgpa: String,
  coursework: String,
  current: { type: Boolean, default: false }
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [String],
  githubUrl: String,
  liveUrl: String,
  achievements: [String] // Bullet achievements
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  date: String,
  url: String
});

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: String,
  address: String,
  portfolioUrl: String,
  githubUsername: String,
  linkedinUrl: String,
  skills: [String],
  experience: [ExperienceSchema],
  education: [EducationSchema],
  projects: [ProjectSchema],
  certifications: [CertificationSchema],
  languages: [{
    language: String,
    proficiency: String
  }],
  achievements: [String],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Profile = mongoose.model('Profile', ProfileSchema);
export default Profile;
