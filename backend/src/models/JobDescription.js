import mongoose from 'mongoose';

const JobDescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: String,
  title: {
    type: String,
    required: true
  },
  descriptionText: {
    type: String,
    required: true
  },
  url: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const JobDescription = mongoose.model('JobDescription', JobDescriptionSchema);
export default JobDescription;
