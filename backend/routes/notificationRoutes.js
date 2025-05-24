import express from 'express';
import Notification from '../models/notificationModel.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create new notification (no auth required for admin operations)
router.post('/create', async (req, res) => {
  try {
    const { userId, type, title, message, details, carId } = req.body;

    console.log('📥 Notification creation request:', {
      userId,
      type,
      title,
      hasMessage: !!message,
      hasDetails: !!details,
      carId
    });

    // Validate required fields
    if (!userId || !type || !title || !message) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: userId, type, title, and message are required' 
      });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid userId format:', userId);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid userId format' 
      });
    }

    // Validate and map notification type
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
        error: `Invalid notification type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    // Validate carId if provided
    if (carId && !mongoose.Types.ObjectId.isValid(carId)) {
      console.error('❌ Invalid carId format:', carId);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid carId format' 
      });
    }

    // Check if user exists (optional check, don't fail if user model not available)
    try {
      const userExists = await mongoose.model('User').exists({ _id: userId });
      if (!userExists) {
        console.warn('⚠️ User not found, but continuing with notification creation:', userId);
      }
    } catch (userCheckError) {
      console.warn('⚠️ Could not verify user existence, continuing anyway:', userCheckError.message);
    }

    // Prepare notification data
    const notificationData = {
      userId: new mongoose.Types.ObjectId(userId),
      type: notificationType,
      title: title.trim(),
      message: message.trim(),
      read: false
    };

    // Add carId if provided
    if (carId) {
      notificationData.carId = new mongoose.Types.ObjectId(carId);
    }

    // Append details to message since 'details' field doesn't exist in schema
    if (details && details.trim()) {
      notificationData.message += `\n\nAdditional details: ${details.trim()}`;
    }

    console.log('💾 Creating notification:', {
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      messageLength: notificationData.message.length,
      hasCarId: !!notificationData.carId
    });

    // Create new notification
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save();

    console.log('✅ Notification created successfully:', savedNotification._id);

    res.status(201).json({ 
      success: true, 
      notification: savedNotification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    
    let errorMessage = 'Failed to create notification';
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      errorMessage = `Validation error: ${validationErrors.join(', ')}`;
    } else if (error.name === 'CastError') {
      errorMessage = `Invalid data format: ${error.message}`;
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all notifications for a user (no auth required for now)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('📋 Fetching notifications for user:', userId);

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid userId format' 
      });
    }
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });
    
    console.log(`📬 Found ${notifications.length} notifications for user ${userId}`);
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notifications',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark notification as read (no auth required for now)
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📖 Marking notification as read:', id);

    // Validate notification ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid notification ID format' 
      });
    }
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      console.warn('❌ Notification not found:', id);
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }
    
    console.log('✅ Notification marked as read:', id);
    
    res.status(200).json({
      success: true,
      notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Error updating notification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update notification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete notification (no auth required for now)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting notification:', id);

    // Validate notification ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid notification ID format' 
      });
    }
    
    const result = await Notification.findByIdAndDelete(id);
    
    if (!result) {
      console.warn('❌ Notification not found for deletion:', id);
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }
    
    console.log('✅ Notification deleted successfully:', id);
    
    res.status(200).json({ 
      success: true,
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete notification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark all notifications as read for a user (no auth required for now)
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('📖 Marking all notifications as read for user:', userId);

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid userId format' 
      });
    }
    
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    
    console.log(`✅ Marked ${result.modifiedCount} notifications as read for user ${userId}`);
    
    res.status(200).json({ 
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Error updating notifications:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update notifications',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;