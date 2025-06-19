import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  username: String,
  name: String,
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Complaint', complaintSchema);