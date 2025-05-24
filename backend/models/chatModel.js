import mongoose from 'mongoose';

// Define a message schema
const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define a conversation schema
const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [MessageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  // Adding a title field for naming conversations
  title: {
    type: String,
    default: function() {
      // Default to concatenated participant IDs if no title is provided
      return this.participants.join('-');
    }
  },
  // Adding carId to associate conversations with car listings
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarListing',
    default: null
  }
});

// Create an index for efficient querying of conversations by participants
ConversationSchema.index({ participants: 1 });
// Add index for finding conversations by car
ConversationSchema.index({ carId: 1 });

// Add a method to check if a user is a participant in a conversation
ConversationSchema.methods.hasParticipant = function(userId) {
  return this.participants.some(participantId => 
    participantId.toString() === userId.toString()
  );
};

// Add a static method to find conversations for a user
ConversationSchema.statics.findUserConversations = function(userId) {
  return this.find({ participants: userId })
    .populate('participants', 'name email')
    .sort({ lastActivity: -1 });
};

// Create the models
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

export { Message, Conversation };