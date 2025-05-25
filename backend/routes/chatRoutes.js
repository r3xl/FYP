import express from 'express';
import { auth } from '../routes/auth.js';
import { 
  createOrGetConversation, 
  getUserConversations, 
  getConversation, 
  sendMessage, 
  deleteConversation, 
  searchUsers 
} from '../controller/chatController.js';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getConversationFromNotification 
} from '../controller/notificationController.js';

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(auth);

// Conversation routes
router.post('/conversations', createOrGetConversation);
router.get('/conversations', getUserConversations);
router.get('/conversations/:id', getConversation);
router.delete('/conversations/:id', deleteConversation);

// Message routes
router.post('/conversations/:id/messages', sendMessage);

// User search route for chat (removed duplicate and fixed middleware)
router.get('/users/search', searchUsers);

// Notification routes
router.get('/notifications/user/:userId', getUserNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/user/:userId/read-all', markAllNotificationsAsRead);
router.get('/notifications/:id/conversation', getConversationFromNotification);

export default router;