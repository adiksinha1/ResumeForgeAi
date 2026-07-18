import mongoose from 'mongoose';

const CoverLetterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  companyName: {
    type: String,
    required: true
  },
  roleName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CoverLetter = mongoose.model('CoverLetter', CoverLetterSchema);
export default CoverLetter;
