import mongoose from 'mongoose';

const ResumeVersionSchema = new mongoose.Schema({
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: 'Manual save'
  },
  // Snapshot of the entire resume data object at this point in time
  resumeData: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ResumeVersion = mongoose.model('ResumeVersion', ResumeVersionSchema);
export default ResumeVersion;
