import mongoose from 'mongoose';
import Notification from '../models/notificationModel.js';
import { Conversation } from '../models/chatModel.js';
import Car from '../models/CarListing.js';

export const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, details, carId } = req.body;
    
    console.log('📥 Received notification creation request:', {
      userId,
      type,
      title,
      message: message?.substring(0, 50) + '...',
      details: details?.substring(0, 50) + '...',
      carId
    });
    
    // Validate request
    if (!userId || !type || !title || !message) {
      console.error('❌ Missing required fields:', { userId, type, title, message: !!message });
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: userId, type, title, and message are required'
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid userId format:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format'
      });
    }
    
    // Check if user exists - more efficient check
    try {
      const userExists = await mongoose.model('User').exists({ _id: userId });
      
      if (!userExists) {
        console.error('❌ User not found:', userId);
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (userCheckError) {
      console.error('❌ Error checking user existence:', userCheckError);
      // Continue anyway - the notification creation might still work
    }
    
    // Validate type against schema enum
    const validTypes = ['message', 'info', 'warning', 'success'];
    let notificationType = type;
    
    // Map 'violation' type to 'warning' since it's not in the schema enum
    if (type === 'violation') {
      notificationType = 'warning';
      console.log('🔄 Mapped violation type to warning');
    }
    
    if (!validTypes.includes(notificationType)) {
      console.error('❌ Invalid notification type:', type);
      return res.status(400).json({
        success: false,
        message: `Invalid notification type. Must be one of: ${validTypes.join(', ')}`
      });
    }
    
    // Validate carId if provided
    if (carId && !mongoose.Types.ObjectId.isValid(carId)) {
      console.error('❌ Invalid carId format:', carId);
      return res.status(400).json({
        success: false,
        message: 'Invalid carId format'
      });
    }
    
    // Create notification object according to schema
    const notificationData = {
      userId: new mongoose.Types.ObjectId(userId),
      type: notificationType,
      title: title.trim(),
      message: message.trim(),
      read: false
    };
    
    // Add optional fields only if they exist and are valid
    if (carId) {
      notificationData.carId = new mongoose.Types.ObjectId(carId);
    }
    
    // Note: 'details' field is not in the schema, so we'll append it to the message
    if (details && details.trim()) {
      notificationData.message += `\n\nAdditional details: ${details.trim()}`;
    }
    
    console.log('💾 Creating notification with data:', {
      ...notificationData,
      message: notificationData.message.substring(0, 100) + '...'
    });
    
    // Create a new notification document
    const notification = new Notification(notificationData);
    
    // Save the notification document
    const savedNotification = await notification.save();
    
    console.log('✅ Notification created successfully:', savedNotification._id);
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification: savedNotification
    });
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Server error occurred while creating notification';
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      errorMessage = `Validation error: ${validationErrors.join(', ')}`;
    } else if (error.name === 'CastError') {
      errorMessage = `Invalid data format: ${error.message}`;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get notifications for a specific user
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('📋 Fetching notifications for user:', userId);
    
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format'
      });
    }
    
    // Security check: ensure the requesting user can only access their own notifications
    // Only apply this check if req.user exists (when authentication middleware is used)
    if (req.user && req.user.userId !== userId) {
      console.warn('🚫 Access denied: User trying to access other user notifications');
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own notifications'
      });
    }
    
    // Get notifications sorted by creation date (newest first)
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });
    
    console.log(`📬 Found ${notifications.length} notifications for user ${userId}`);
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Error getting user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📖 Marking notification as read:', id);
    
    // Validate notification ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format'
      });
    }
    
    // Find the notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      console.warn('❌ Notification not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Security check: ensure the requesting user can only mark their own notifications
    // Only apply this check if req.user exists (when authentication middleware is used)
    if (req.user && notification.userId.toString() !== req.user.userId) {
      console.warn('🚫 Access denied: User trying to mark other user notification as read');
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own notifications'
      });
    }
    
    // Update to mark as read
    notification.read = true;
    await notification.save();
    
    console.log('✅ Notification marked as read:', id);
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('📖 Marking all notifications as read for user:', userId);
    
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format'
      });
    }
    
    // Security check: ensure the requesting user can only access their own notifications
    // Only apply this check if req.user exists (when authentication middleware is used)
    if (req.user && req.user.userId !== userId) {
      console.warn('🚫 Access denied: User trying to mark all notifications for other user');
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only update your own notifications'
      });
    }
    
    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    
    console.log(`✅ Marked ${result.modifiedCount} notifications as read for user ${userId}`);
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Get or create conversation from notification
export const getConversationFromNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.userId : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    console.log('💬 Getting conversation from notification:', id);
    
    // Validate notification ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format'
      });
    }
    
    // Find the notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Security check: ensure the requesting user can only access their own notifications
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own notifications'
      });
    }
    
    // If notification has a carId, find existing conversation or related info
    if (notification.carId) {
      // Find car info
      const car = await Car.findById(notification.carId)
        .select('brand model year mileage price owner');
      
      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Car listing not found'
        });
      }
      
      // Format car info for return
      const carInfo = {
        id: car._id,
        brand: car.brand,
        model: car.model,
        year: car.year,
        mileage: car.mileage,
        price: car.price
      };
      
      // Find existing conversation between these users about this car
      let conversation = await Conversation.findOne({
        carId: notification.carId,
        participants: { $all: [userId, car.owner.toString()] }
      });
      
      // If no conversation exists, create one
      if (!conversation) {
        conversation = new Conversation({
          participants: [userId, car.owner.toString()],
          messages: [],
          carId: notification.carId
        });
        await conversation.save();
      }
      
      console.log('✅ Conversation found/created for notification');
      
      // Return conversation ID and car info
      return res.status(200).json({
        success: true,
        conversationId: conversation._id,
        carInfo
      });
    }
    
    // If notification doesn't have a carId
    res.status(200).json({
      success: true,
      message: 'No car related conversation found for this notification'
    });
  } catch (error) {
    console.error('❌ Error getting conversation from notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};