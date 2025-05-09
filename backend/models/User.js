import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const NotificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'violation', 'info', etc.
  title: { type: String, required: true },
  message: { type: String, required: true },
  details: { type: String },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'CarListing' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  notifications: [NotificationSchema],
});

// Add this pre-save hook to hash passwords
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10); // Hash the password
  next();
});

export default mongoose.model('User', UserSchema);