import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Conversation } from './models/chatModel.js';
import Notification from './models/notificationModel.js';
import User from './models/User.js';

const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Store online users
  const onlineUsers = new Map();
  
  // Helper function to check if user is participant in conversation
  const isParticipant = (conversation, userId) => {
    if (!conversation || !conversation.participants) return false;
    return conversation.participants.some(p => 
      p._id ? p._id.toString() === userId.toString() : p.toString() === userId.toString()
    );
  };
  
  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token || !token.startsWith('Bearer ')) {
        return next(new Error('Authentication error: Token missing or invalid format'));
      }
      
      const tokenValue = token.split(' ')[1];
      
      // Verify the token
      const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET || 'default_secret');
      
      // Get user from database to check role
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Don't allow admins to connect to chat
      if (user.role === 'admin') {
        return next(new Error('Authentication error: Admins cannot access chat'));
      }
      
      // Set user data on socket
      socket.user = {
        userId: decoded.userId,
        name: user.name,
        email: user.email
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: ' + error.message));
    }
  });
  
  // Handle connections
  io.on('connection', (socket) => {
    const userId = socket.user.userId;
    console.log(`User connected: ${userId} (${socket.user.name})`);
    
    // Add user to online users map
    onlineUsers.set(userId, socket.id);
    
    // Join user to their user-specific room for notifications
    socket.join(`user:${userId}`);
    
    // Handle joining all user's conversations
    socket.on('join-conversations', async () => {
      try {
        // Find all conversations for this user
        const conversations = await Conversation.find({ participants: userId });
        
        // Join each conversation room
        conversations.forEach(conv => {
          socket.join(`conversation:${conv._id}`);
        });
        
        console.log(`User ${userId} joined ${conversations.length} conversation rooms`);
        
        // Acknowledge the join
        socket.emit('conversations-joined', { count: conversations.length });
      } catch (error) {
        console.error('Error joining conversation rooms:', error);
        socket.emit('error', { message: 'Failed to join conversations' });
      }
    });
    
    // Join a specific conversation
    socket.on('join-conversation', async (conversationId, callback) => {
      try {
        // Verify user is participant in this conversation
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          const errorMsg = 'Conversation not found';
          if (callback) callback({ error: errorMsg });
          return socket.emit('error', { message: errorMsg });
        }
        
        if (!isParticipant(conversation, userId)) {
          const errorMsg = 'Not a participant in this conversation';
          if (callback) callback({ error: errorMsg });
          return socket.emit('error', { message: errorMsg });
        }
        
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation: ${conversationId}`);
        
        if (callback) callback({ success: true });
        
      } catch (error) {
        console.error('Error joining conversation:', error);
        const errorMsg = 'Failed to join conversation';
        if (callback) callback({ error: errorMsg });
        socket.emit('error', { message: errorMsg });
      }
    });
    
    // Handle leaving a conversation
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation: ${conversationId}`);
    });
    
    // Handle typing indicator
    socket.on('typing', async ({ conversationId, isTyping }, callback) => {
      try {
        // Get the conversation to check if user is a participant
        const conversation = await Conversation.findById(conversationId)
          .populate('participants', 'name');
        
        if (!conversation) {
          const errorMsg = 'Conversation not found';
          if (callback) callback({ error: errorMsg });
          return socket.emit('error', { message: errorMsg });
        }
        
        // Check if user is a participant using our helper function
        if (!isParticipant(conversation, userId)) {
          const errorMsg = 'Not a participant in this conversation';
          console.log(`Typing indicator failed - User ${userId} not participant in conversation ${conversationId}`);
          console.log('Participants:', conversation.participants.map(p => p._id.toString()));
          if (callback) callback({ error: errorMsg });
          return socket.emit('error', { message: errorMsg });
        }
        
        // Find user information to include in the typing event
        const user = conversation.participants.find(p => p._id.toString() === userId);
        
        // Broadcast typing status to other participants (not including sender)
        socket.to(`conversation:${conversationId}`).emit('user-typing', {
          conversationId,
          userId,
          userName: user ? user.name : socket.user.name,
          isTyping
        });
        
        if (callback) callback({ success: true });
        
      } catch (error) {
        console.error('Error handling typing indicator:', error);
        const errorMsg = 'Failed to handle typing indicator';
        if (callback) callback({ error: errorMsg });
        socket.emit('error', { message: errorMsg });
      }
    });
    
    // Handle check participation
    socket.on('check-participation', async (conversationId, callback) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          return callback({ error: 'Conversation not found', isParticipant: false });
        }
        
        const userIsParticipant = isParticipant(conversation, userId);
        callback({ isParticipant: userIsParticipant });
        
      } catch (error) {
        console.error('Error checking participation:', error);
        callback({ error: 'Failed to check participation', isParticipant: false });
      }
    });
    
    // Handle sending messages
    socket.on('send-message', async ({ conversationId, content, isCarInquiry }) => {
      try {
        console.log(`User ${userId} sending message to conversation ${conversationId}`);
        
        // Validate content
        if (!content || !content.trim()) {
          return socket.emit('error', { message: 'Message content cannot be empty' });
        }
        
        // Find the conversation
        const conversation = await Conversation.findById(conversationId)
          .populate('participants', 'name email');
        
        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found' });
        }
        
        // Check if user is a participant using our helper function
        if (!isParticipant(conversation, userId)) {
          console.log('User not participant. User:', userId);
          console.log('Participants:', conversation.participants.map(p => p._id.toString()));
          return socket.emit('error', { message: 'Not a participant in this conversation' });
        }
        
        // Get sender info
        const sender = conversation.participants.find(p => p._id.toString() === userId.toString());
        
        // Add the new message
        const newMessage = {
          sender: userId,
          content: content.trim(),
          readBy: [userId], // Mark as read by sender
          createdAt: new Date()
        };
        
        conversation.messages.push(newMessage);
        conversation.lastActivity = new Date();
        await conversation.save();
        
        // Get the fully populated message for sending
        const populatedConversation = await Conversation.findById(conversationId)
          .populate('participants', 'name email')
          .populate({
            path: 'messages.sender',
            select: 'name email'
          });
        
        const sentMessage = populatedConversation.messages[populatedConversation.messages.length - 1];
        
        // Create notifications for all other participants
        const otherParticipants = conversation.participants.filter(
          p => p._id.toString() !== userId.toString()
        );
        
        // Create notifications for other participants
        for (const participant of otherParticipants) {
          try {
            const notification = new Notification({
              userId: participant._id,
              type: 'message',
              title: 'New Message',
              message: `${sender.name} sent you a message${isCarInquiry ? ' about a car listing' : ''}`,
              conversationId: conversation._id,
              carId: conversation.carId || null,
              read: false
            });
            
            await notification.save();
            
            // Emit notification to the user if they're online
            io.to(`user:${participant._id}`).emit('new-notification', {
              ...notification.toObject(),
              _id: notification._id
            });
            
            console.log(`Notification sent to user ${participant._id}`);
          } catch (notificationError) {
            console.error('Error creating/sending notification:', notificationError);
            // Don't fail message sending if notification fails
          }
        }
        
        // Emit the new message to all participants in the conversation
        io.to(`conversation:${conversationId}`).emit('new-message', {
          conversationId,
          message: sentMessage
        });
        
        // Emit conversation updated to all participants  
        io.to(`conversation:${conversationId}`).emit('conversation-updated', {
          conversationId,
          lastActivity: conversation.lastActivity
        });
        
        // Acknowledge successful message sending to sender
        socket.emit('message-sent', {
          success: true,
          message: sentMessage
        });
        
        console.log(`Message sent successfully in conversation ${conversationId}`);
        
      } catch (error) {
        console.error('Error sending message via socket:', error);
        socket.emit('error', { message: 'Failed to send message: ' + error.message });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${userId} - Reason: ${reason}`);
      onlineUsers.delete(userId);
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });
  
  return io;
};

export default setupSocketIO;