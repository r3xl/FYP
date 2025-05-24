import { Conversation } from '../models/chatModel.js';
import User from '../models/User.js';
import Notification from '../models/notificationModel.js';
import mongoose from 'mongoose';

// Create a new conversation or get existing one
export const createOrGetConversation = async (req, res) => {
  try {
    const { participantIds, carId } = req.body;
    const currentUserId = req.user.userId;
    
    // Ensure current user is included in participants
    const allParticipantIds = [...new Set([...participantIds, currentUserId])];
    
    // Validate that all participants exist and aren't admins
    const participants = await User.find({ 
      _id: { $in: allParticipantIds },
      role: { $ne: 'admin' } // Exclude admins
    });
    
    // Check if we found all participants
    if (participants.length !== allParticipantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more participants do not exist or are admin users'
      });
    }
    
    // Sort participant IDs to ensure consistent lookup
    const sortedParticipantIds = [...allParticipantIds].sort();
    
    // Check if conversation already exists between these users
    let conversation = await Conversation.findOne({
      participants: { $all: sortedParticipantIds, $size: sortedParticipantIds.length }
    }).populate('participants', 'name email');
    
    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: sortedParticipantIds,
        messages: [],
        carId: carId || null, // Store carId if provided
        hiddenFor: [] // Initialize as empty array
      });
      await conversation.save();
      // Re-populate participants after saving
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email');
    } else {
      // If conversation exists but is hidden for current user, unhide it
      if (conversation.isHiddenFor(currentUserId)) {
        conversation.unhideForUser(currentUserId);
        await conversation.save();
      }
    }
    
    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Get all conversations for current user (excluding hidden ones)
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find all conversations where the user is a participant and hasn't hidden it
    const conversations = await Conversation.find({ 
      participants: userId,
      hiddenFor: { $ne: userId } // Exclude conversations hidden for this user
    })
    .populate('participants', 'name email')
    .populate({
      path: 'messages.sender',
      select: 'name email'
    })
    .sort({ lastActivity: -1 });
    
    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error getting user conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Get a single conversation by ID
export const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID format'
      });
    }
    
    // Check if conversation exists
    const conversation = await Conversation.findById(id)
      .populate('participants', 'name email')
      .populate({
        path: 'messages.sender',
        select: 'name email'
      });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Verify the current user is a participant
    const isParticipant = conversation.participants.some(
      participant => participant._id.toString() === userId.toString()
    );
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a participant in this conversation'
      });
    }
    
    // Check if conversation is hidden for this user
    if (conversation.isHiddenFor(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Mark messages as read by current user
    let hasUnreadMessages = false;
    conversation.messages.forEach(message => {
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        hasUnreadMessages = true;
      }
    });
    
    // Save if there were unread messages
    if (hasUnreadMessages) {
      await conversation.save();
    }
    
    // Return the conversation
    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Send a message in a conversation
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isCarInquiry } = req.body;
    const userId = req.user.userId;
    
    // Validate message content
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findById(id)
      .populate('participants', 'name email');
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Verify the current user is a participant
    if (!conversation.hasParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a participant in this conversation'
      });
    }
    
    // Get sender details from participants
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
    
    // Unhide conversation for all participants who may have hidden it
    // This ensures that when someone sends a message, the conversation reappears
    // for anyone who had previously "deleted" it
    conversation.participants.forEach(participantId => {
      if (conversation.isHiddenFor(participantId)) {
        conversation.unhideForUser(participantId);
      }
    });
    
    await conversation.save();
    
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
        console.log(`Notification created for user ${participant._id}`);
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the message send if notification fails
      }
    }
    
    // Populate the sender details in the new message for the response
    const populatedConversation = await Conversation.findById(id)
      .populate('participants', 'name email')
      .populate({
        path: 'messages.sender',
        select: 'name email'
      });
    
    const sentMessage = populatedConversation.messages[populatedConversation.messages.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      sentMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Soft delete a conversation (hide it for the current user only)
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if conversation exists
    const conversation = await Conversation.findById(id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Verify the current user is a participant
    if (!conversation.hasParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a participant in this conversation'
      });
    }
    
    // Check if conversation is already hidden for this user
    if (conversation.isHiddenFor(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Conversation is already deleted for this user'
      });
    }
    
    // Hide the conversation for this user only
    conversation.hideForUser(userId);
    await conversation.save();
    
    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully (hidden from your view)'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Search for users to chat with
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.userId;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Find users matching the query but exclude admins and current user
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },  // Not the current user
        { role: { $ne: 'admin' } },       // Not an admin
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },  // Case-insensitive name search
            { email: { $regex: query, $options: 'i' } }  // Case-insensitive email search
          ]
        }
      ]
    }).select('name email');
    
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};