import mongoose from 'mongoose';
import Notification from '../models/notificationModel.js';

export const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, details, carId } = req.body;
    
    // Validate request
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing'
      });
    }
    
    // Check if user exists in a more efficient way - just check existence
    const userExists = await mongoose.model('User').exists({ _id: userId });
    
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create a new notification document
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      details: details || null,
      carId: carId || null,
      read: false
      // createdAt will be set automatically by the schema default
    });
    
    // Save the notification document
    const savedNotification = await notification.save();
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification: savedNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};