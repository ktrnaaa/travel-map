import { Schema, model } from 'mongoose';

const supportSchema = new Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const Support = model('support_messages', supportSchema, 'user-report');
export default Support;
