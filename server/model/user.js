import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId},
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.model( 'User', userSchema, 'users');