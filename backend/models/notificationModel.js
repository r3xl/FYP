import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['violation', 'system', 'info']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarListing'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if the model exists before creating it
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;