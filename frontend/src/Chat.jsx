import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import './chat.css'

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [user, setUser] = useState(null); // Initialize as null, not {}
  const location = useLocation();
  const [joinedConversationId, setJoinedConversationId] = useState(null);
  
  const messageContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();
  
  const API_URL = 'http://localhost:5000/api' ;
  
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { 
        state: { 
          message: 'Please log in to access the chat.' 
        } 
      });
      return;
    }

    // Get userId from localStorage and set user state
    const userId = localStorage.getItem('userId');
    if (userId) {
      setUser({ userId });
    } else {
      // If userId is not in localStorage, try to decode from token
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        if (payload.exp && payload.exp < Date.now() / 1000) {
          console.log('Token expired, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login', { 
            state: { 
              message: 'Your session has expired. Please log in again.' 
            } 
          });
        } else {
          // Set user state with userId from token
          setUser({ userId: payload.userId });
          // Save userId to localStorage for future use
          localStorage.setItem('userId', payload.userId);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        navigate('/login', { 
          state: { 
            message: 'Authentication error. Please log in again.' 
          } 
        });
      }
    }
  }, [navigate]);
  
  // Setup headers with token for API requests
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  // Initialize socket connection - only after user is set
  useEffect(() => {
    if (!token || !user || !user.userId) {
      return;
    }
    
    console.log("Initializing socket with user:", user);
    
    // Close any existing socket first to prevent duplicate connections
    if (socket) {
      console.log("Cleaning up previous socket connection");
      socket.disconnect();
      setSocket(null);
    }
    
    // Create the socket with a more reliable connection
    const socketInstance = io('http://localhost:5000', {
      auth: {
        token: `Bearer ${token}`
      },
      reconnection: true,           // Enable reconnection
      reconnectionAttempts: 5,      // Try to reconnect 5 times
      reconnectionDelay: 1000,      // Start with 1 second delay
      reconnectionDelayMax: 5000,   // Maximum 5 seconds between reconnection attempts
      timeout: 20000                // Longer connection timeout (20 seconds)
    });
    
    // Improved connection event handling
    socketInstance.on('connect', () => {
      console.log('Socket connected with ID:', socketInstance.id);
      toast.success('Connected to chat server');
      
      // Delay joining conversations to ensure socket is fully ready
      setTimeout(() => {
        socketInstance.emit('join-conversations');
        
        // If we already have a conversation loaded, join that specific room
        if (currentConversation) {
          socketInstance.emit('join-conversation', currentConversation._id);
          console.log(`Re-joined conversation room: ${currentConversation._id}`);
        }
        
        // Fetch conversations after socket is confirmed connected
        fetchConversations();
      }, 500);
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError(`Connection error: ${error.message}`);
      toast.error(`Socket connection error: ${error.message}`);
    });
    
    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, reconnect manually
        socketInstance.connect();
      }
      // if the disconnection was initiated by the client, no need to reconnect
    });
    
    socketInstance.on('new-message', ({ conversationId, message }) => {
      console.log('Received new message for conversation:', conversationId);
      
      // Update conversations with new message
      setConversations(prev => {
        return prev.map(conv => {
          if (conv._id === conversationId) {
            // Make sure messages array exists
            const existingMessages = conv.messages || [];
            return {
              ...conv,
              messages: [...existingMessages, message],
              lastActivity: new Date()
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
      });
      
      // If this is the current conversation, update it
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(prev => ({
          ...prev,
          messages: [...(prev.messages || []), message],
          lastActivity: new Date()
        }));
      }
    });
    
    socketInstance.on('conversation-updated', ({ conversationId }) => {
      console.log('Conversation updated:', conversationId);
      // Refresh the conversations list
      fetchConversations();
    });
    
    socketInstance.on('user-typing', ({ conversationId, userId, userName, isTyping }) => {
      setTypingUsers(prev => ({
        ...prev,
        [conversationId]: isTyping 
          ? { ...(prev[conversationId] || {}), [userId]: userName }
          : Object.fromEntries(
              Object.entries(prev[conversationId] || {})
                .filter(([key]) => key !== userId)
            )
      }));
    });
    
    // Improved error handling
    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      if (error.message && error.message.includes('Not a participant')) {
        // Handle participant error specifically
        if (currentConversation) {
          toast.error(`You're not a participant in this conversation`);
          fetchConversations(); // Refresh conversation list
          setCurrentConversation(null); // Clear current conversation
        }
      } else {
        setError(error.message || 'Unknown socket error');
        toast.error(`Socket error: ${error.message || 'Unknown error'}`);
      }
    });
    
    // Listen for successful message sent acknowledgment
    socketInstance.on('message-sent', (data) => {
      console.log('Message sent successfully:', data);
    });
    
    setSocket(socketInstance);
  
    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [token, user?.userId]); // Only depend on token and user ID
  
  // Fetch conversations on mount - only after user is set
  useEffect(() => {
    if (token && user) {
      fetchConversations();
    }
  }, [token, user]); // Added user as dependency
  
  // Scroll to bottom of messages when new message arrives
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [currentConversation?.messages]);
  
  useEffect(() => {
    // Only proceed if we have all required data
    if (location.state?.openConversation && token && user && socket?.connected) {
      const conversationId = location.state.openConversation;
      
      // Load the conversation
      loadConversation(conversationId).then(() => {
        // Only send initial message if we have car info and it's a new conversation
        if (location.state?.carInfo) {
          // Check if this conversation is new/empty before sending the auto-message
          // This prevents duplicate messages on refreshes or re-navigation
          const isNewConversation = !conversations.find(conv => 
            conv._id === conversationId && conv.messages && conv.messages.length > 0
          );
          
          if (isNewConversation) {
            const carInfo = location.state.carInfo;
            const autoMessage = `Hi, I'm interested in your ${carInfo.brand} ${carInfo.model}. Is it still available?`;
            
            // Use a single method to send the message
            socket.emit('send-message', {
              conversationId: conversationId,
              content: autoMessage,
              isCarInquiry: true
            });
            
            console.log("Auto-message sent for car inquiry");
          }
        }
        
        // Clear the location state to prevent duplicate actions on refresh
        window.history.replaceState({}, document.title);
      }).catch(error => {
        console.error('Error loading conversation from location state:', error);
      });
    }
  }, [location.state, token, user, socket?.connected, conversations]);
      
  // Fetch all conversations for the current user
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/chat/conversations`, config);
      
      // Filter out any conversations that the user might not have permission to view
      // This is a safeguard in case the backend returns conversations the user can't access
      const authorizedConversations = response.data.conversations;
      
      setConversations(authorizedConversations);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to fetch conversations');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load a specific conversation
  const loadConversation = async (conversationId) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // First, fetch the conversation data from the server to verify access
      const response = await axios.get(
        `${API_URL}/chat/conversations/${conversationId}`, 
        config
      );
      
      // Ensure we have proper data
      if (!response.data.conversation) {
        throw new Error('Invalid conversation data received from server');
      }
      
      // Make sure messages array is defined
      const conversation = {
        ...response.data.conversation,
        messages: response.data.conversation.messages || []
      };
      
      // Check if current user is actually a participant
      const isParticipant = conversation.participants.some(p => p._id === user.userId);
      if (!isParticipant) {
        throw new Error('You are not a participant in this conversation');
      }
      
      // Check if the socket is connected first
      if (socket && socket.connected) {
        // Make sure we leave any previous conversation room
        if (currentConversation && joinedConversationId) {
          socket.emit('leave-conversation', currentConversation._id);
          console.log(`Left conversation room: ${currentConversation._id}`);
          setJoinedConversationId(null);
        }
        
        // Join the new conversation room
        socket.emit('join-conversation', conversationId, (response) => {
          if (response && response.error) {
            console.error('Error joining conversation room:', response.error);
            toast.error(`Error joining conversation: ${response.error}`);
            setJoinedConversationId(null);
          } else {
            console.log(`Joined conversation room: ${conversationId}`);
            setJoinedConversationId(conversationId);
          }
        });
      }
      
      // Update UI state
      setCurrentConversation(conversation);
      setError(null); // Clear any previous errors
      
      return conversation; // Return the conversation for promise chaining
      
    } catch (error) {
      console.error('Error loading conversation:', error);
      
      // Handle specific error responses
      if (error.response && error.response.status === 403) {
        toast.error('Access denied: You are not a participant in this conversation');
        
        // Remove this conversation from the local conversations list
        setConversations(prevConversations => 
          prevConversations.filter(conv => conv._id !== conversationId)
        );
      } else {
        setError('Failed to load conversation');
        toast.error('Failed to load conversation: ' + (error.response?.data?.message || error.message));
      }
      
      // Clear current conversation on error
      setCurrentConversation(null);
      setJoinedConversationId(null);
      throw error; // Re-throw for promise chaining
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send a message
  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    
    if (!message.trim() || !currentConversation || !user) return;
    
    try {
      // Check if this is a car inquiry based on location state
      const isCarInquiry = location.state?.carInfo && 
                           location.state?.openConversation === currentConversation._id &&
                           currentConversation.messages.length === 0;
      
      // Create a unique temporary ID for this message
      const tempMessageId = 'temp-' + Date.now();
      
      // Add a temporary message to the UI for immediate feedback
      const tempMessage = {
        _id: tempMessageId,
        sender: { _id: user.userId, name: 'You' },
        content: message,
        readBy: [user.userId],
        createdAt: new Date()
      };
      
      // Update the UI immediately with temporary message
      setCurrentConversation(prev => ({
        ...prev,
        messages: [...prev.messages, tempMessage]
      }));
      
      // Clear the input field immediately to improve user experience
      setMessage('');
      
      // Cancel typing indicator
      handleTypingStop();
      
      // Use socket if available
      if (socket && socket.connected) {
        console.log('Sending message via socket:', currentConversation._id);
        
        try {
          // Use a promise to ensure we're joined before sending the message
          await new Promise((resolve, reject) => {
            // First verify we're a participant in this conversation
            socket.emit('check-participation', currentConversation._id, (response) => {
              if (response && response.error) {
                console.error('Participation check failed:', response.error);
                reject(new Error(response.error));
              } else if (response && response.isParticipant === false) {
                reject(new Error('Not a participant in this conversation'));
              } else {
                // Then join the conversation
                socket.emit('join-conversation', currentConversation._id, (joinResponse) => {
                  if (joinResponse && joinResponse.error) {
                    console.error('Error joining conversation:', joinResponse.error);
                    reject(new Error(joinResponse.error));
                  } else {
                    console.log('Successfully joined conversation room before sending message');
                    resolve();
                  }
                });
              }
            });
          });
          
          // Set up message acknowledgment handler before sending
          const messagePromise = new Promise((resolve, reject) => {
            // Listen for successful message acknowledgment
            const messageTimeout = setTimeout(() => {
              socket.off('message-sent');
              reject(new Error('Message sending timed out'));
            }, 5000);
            
            socket.once('message-sent', ({ success, message: sentMessage }) => {
              clearTimeout(messageTimeout);
              if (success) {
                // Replace temporary message with the real one from the server
                setCurrentConversation(prev => ({
                  ...prev,
                  messages: prev.messages
                    .filter(msg => msg._id !== tempMessageId)
                    .concat(sentMessage)
                }));
                console.log('Message sent successfully via socket');
                resolve(sentMessage);
              } else {
                reject(new Error('Server reported message sending failure'));
              }
            });
          });
          
          // Set up error handler
          socket.once('error', (error) => {
            console.error('Socket error during message send:', error);
            
            // If we receive a "not a participant" error, refresh the conversations list
            if (error.message === 'Not a participant in this conversation') {
              toast.error('You are not a participant in this conversation');
              fetchConversations();
              setCurrentConversation(null);
            } else {
              toast.error(`Error: ${error.message}`);
            }
            
            // Remove the temporary message on error
            setCurrentConversation(prev => ({
              ...prev,
              messages: prev.messages.filter(msg => msg._id !== tempMessageId)
            }));
          });
          
          // Send via socket for real-time delivery
          socket.emit('send-message', {
            conversationId: currentConversation._id,
            content: message,
            isCarInquiry: isCarInquiry
          });
          
          // Wait for message to be sent or error
          await messagePromise;
          
        } catch (error) {
          console.error('Failed to send message via socket:', error);
          
          // Fallback to REST API if socket send fails
          console.log('Socket send failed, using REST API instead');
          await sendMessageViaAPI(tempMessageId, message, isCarInquiry);
        }
      } else {
        // Fallback to REST API if socket is not available
        console.log('Socket not available, using REST API');
        await sendMessageViaAPI(tempMessageId, message, isCarInquiry);
      }
      
      // Clear the location state to prevent duplicate "isCarInquiry" flags
      if (isCarInquiry && location.state) {
        window.history.replaceState({}, document.title);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      toast.error('Failed to send message: ' + (error.response?.data?.message || error.message));
      
      // Ensure message input is cleared even on error
      setMessage('');
    }
  };

  const sendMessageViaAPI = async (tempMessageId, messageContent, isCarInquiry) => {
    const response = await axios.post(
      `${API_URL}/chat/conversations/${currentConversation._id}/messages`,
      { 
        content: messageContent,
        isCarInquiry: isCarInquiry 
      },
      config
    );
    
    // Remove the temporary message
    setCurrentConversation(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg._id !== tempMessageId)
    }));
    
    // If successful, add the actual message from the server
    if (response.data.success) {
      setCurrentConversation(prev => ({
        ...prev,
        messages: [...prev.messages, response.data.sentMessage],
        lastActivity: new Date()
      }));
    }
    
    return response;
  };
  
// Handle typing indicator
const handleTyping = () => {
  if (!socket || !currentConversation || !user) return;
  
  // Check if socket is connected
  if (!socket.connected) {
    console.warn('Socket not connected when trying to send typing indicator');
    return;
  }
  
  // Clear previous timeout
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }
  
  // Check if we're properly joined to this conversation room
  if (joinedConversationId !== currentConversation._id) {
    console.log('Not joined to current conversation room, joining first...');
    
    socket.emit('join-conversation', currentConversation._id, (joinResponse) => {
      if (joinResponse && joinResponse.error) {
        console.error('Failed to join conversation for typing:', joinResponse.error);
        fetchConversations();
        toast.error('There was an issue with this conversation. Refreshing data...');
        return;
      }
      
      console.log('Successfully joined conversation room for typing');
      setJoinedConversationId(currentConversation._id);
      
      // Now send typing indicator
      socket.emit('typing', {
        conversationId: currentConversation._id,
        isTyping: true
      });
    });
    
    // Set timeout regardless
    typingTimeoutRef.current = setTimeout(handleTypingStop, 2000);
    return;
  }
  
  // We're already joined, just send the typing indicator
  socket.emit('typing', {
    conversationId: currentConversation._id,
    isTyping: true
  }, (response) => {
    if (response && response.error) {
      console.error('Error sending typing indicator:', response.error);
      
      // If we get a "not a participant" error, mark as not joined and try again
      if (response.error.includes('Not a participant')) {
        console.log('Lost participation in conversation, attempting to rejoin...');
        setJoinedConversationId(null);
        
        // Try to rejoin the conversation
        socket.emit('join-conversation', currentConversation._id, (joinResponse) => {
          if (joinResponse && joinResponse.error) {
            console.error('Failed to rejoin conversation:', joinResponse.error);
            fetchConversations();
            toast.error('There was an issue with this conversation. Refreshing data...');
          } else {
            console.log('Successfully rejoined conversation, retrying typing indicator');
            setJoinedConversationId(currentConversation._id);
            // Retry the typing indicator after successful rejoin
            socket.emit('typing', {
              conversationId: currentConversation._id,
              isTyping: true
            });
          }
        });
      }
    }
  });
  
  // Set timeout to stop typing after 2 seconds of inactivity
  typingTimeoutRef.current = setTimeout(handleTypingStop, 2000);
};
  
  // Handle stopping typing indicator
  const handleTypingStop = () => {
    if (!socket || !currentConversation || !user) return;
    
    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // Emit stop typing event
    socket.emit('typing', {
      conversationId: currentConversation._id,
      isTyping: false
    });
  };
  
  // Search for users to chat with
  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await axios.get(
        `${API_URL}/chat/users/search?query=${encodeURIComponent(searchQuery)}`,
        config
      );
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users');
    }
  };
  
  // Create a new conversation
  const createNewConversation = async () => {
    if (selectedUsers.length === 0 || !user) return;
    
    try {
      const participantIds = [...selectedUsers.map(u => u._id), user.userId];
      
      const response = await axios.post(
        `${API_URL}/chat/conversations`,
        { participantIds },
        config
      );
      
      // Close modal and reset selections
      setShowNewChatModal(false);
      setSelectedUsers([]);
      setSearchQuery('');
      setSearchResults([]);
      
      // Refresh conversations and load the new one
      await fetchConversations();
      loadConversation(response.data.conversation._id);
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError('Failed to create conversation');
    }
  };
  
  // Toggle user selection in new conversation modal
  const toggleUserSelection = (u) => {
    if (selectedUsers.some(selectedUser => selectedUser._id === u._id)) {
      setSelectedUsers(selectedUsers.filter(selectedUser => selectedUser._id !== u._id));
    } else {
      setSelectedUsers([...selectedUsers, u]);
    }
  };
  
  // Delete a conversation
  const deleteConversation = async (conversationId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?') || !user) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/chat/conversations/${conversationId}`, config);
      
      // Remove from state and reset current if needed
      setConversations(conversations.filter(conv => conv._id !== conversationId));
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
  };
  
  // Get conversation title based on participants
  const getConversationTitle = (conversation) => {
    if (!conversation || !conversation.participants || !user) return 'Chat';
    
    // Filter out current user and join other participants' names
    const otherParticipants = conversation.participants.filter(
      p => p._id !== user.userId
    );
    
    if (otherParticipants.length === 0) return 'Self Chat';
    
    return otherParticipants.map(p => p.name).join(', ');
  };
  
  // Check if message is read by all participants
  const isMessageRead = (message) => {
    if (!currentConversation) return false;
    
    const participantCount = currentConversation.participants.length;
    return message.readBy.length === participantCount;
  };

  const renderCarInfo = () => {
    if (currentConversation?.carId && !carInfo) {
      // If we have carId but no car info, we could fetch it here
      // fetchCarInfo(currentConversation.carId);
      return null;
    }
    
    if (location.state?.carInfo) {
      const car = location.state.carInfo;
      return (
        <div className="car-inquiry-banner">
          <div className="car-info">
            <h4>Discussion about: {car.brand} {car.model}</h4>
            <p>{car.year} · {car.mileage} miles · ${car.price}</p>
          </div>
          <button 
            className="view-listing-btn"
            onClick={() => navigate(`/cars/${currentConversation.carId}`)}
          >
            View Listing
          </button>
        </div>
      );
    }
    
    return null;
  };
  
  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!currentConversation || 
        !typingUsers[currentConversation._id] || 
        Object.keys(typingUsers[currentConversation._id]).length === 0) {
      return null;
    }
    
    const typingUserNames = Object.values(typingUsers[currentConversation._id]);
    
    return (
      <div className="typing-indicator">
        <span>{typingUserNames.join(', ')} typing...</span>
        <span className="dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </span>
      </div>
    );
  };
  
  // Toggle new chat modal
  const toggleNewChatModal = () => {
    setShowNewChatModal(!showNewChatModal);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
  };
  
  // Render message time in a readable format
  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'p'); // 'p' gives time like "10:15 AM"
  };
  
  // Render date divider if message is on a different day from previous
  const shouldShowDateDivider = (index, messages) => {
    if (index === 0) return true;
    
    const currentDate = new Date(messages[index].createdAt).toDateString();
    const prevDate = new Date(messages[index - 1].createdAt).toDateString();
    
    return currentDate !== prevDate;
  };
  
  // Render date in a readable format for dividers
  const formatDateDivider = (timestamp) => {
    return format(new Date(timestamp), 'EEEE, MMMM d, yyyy');
  };

  // If we don't have user information yet or are checking auth, show loading
  if (!user) {
    return <div className="loading-container">Checking authentication...</div>;
  }
  
  return (
    <div className="chat-container">
      {/* Sidebar with conversation list */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Conversations</h2>
          <button 
            className="new-chat-btn"
            onClick={toggleNewChatModal}
          >
            <i className="fas fa-plus"></i> New Chat
          </button>
        </div>
        
        {/* Conversation List */}
        <div className="conversation-list">
          {isLoading && !conversations.length ? (
            <div className="loading">Loading conversations...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            conversations.map(conversation => (
              <div 
                key={conversation._id}
                className={`conversation-item ${currentConversation?._id === conversation._id ? 'active' : ''}`}
                onClick={() => loadConversation(conversation._id)}
              >
                <div className="conversation-info">
                  <h3>{getConversationTitle(conversation)}</h3>
                  <p className="last-message">
                    {conversation.messages.length > 0 
                      ? `${conversation.messages[conversation.messages.length - 1].content.substring(0, 30)}${conversation.messages[conversation.messages.length - 1].content.length > 30 ? '...' : ''}`
                      : 'No messages yet'}
                  </p>
                </div>
                <div className="conversation-meta">
                  <span className="timestamp">
                    {conversation.lastActivity 
                      ? format(new Date(conversation.lastActivity), 'MMM d')
                      : ''}
                  </span>
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation._id);
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="chat-main">
        {currentConversation ? (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <div className="header-left">
                <button 
                  className="back-btn" 
                  onClick={() => navigate('/')}
                  aria-label="Back to website"
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <h2>{getConversationTitle(currentConversation)}</h2>
              </div>
              <div className="chat-actions">
                <button
                  className="delete-conversation-btn"
                  onClick={() => deleteConversation(currentConversation._id)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
            
            {/* Messages container */}
            <div className="messages-container" ref={messageContainerRef}>
              {currentConversation.messages.length === 0 ? (
                <div className="empty-chat">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="messages">
                  {currentConversation.messages.map((message, index) => {
                    const isCurrentUser = message.sender._id === user.userId;
                    
                    return (
                      <React.Fragment key={index}>
                        {shouldShowDateDivider(index, currentConversation.messages) && (
                          <div className="date-divider">
                            {formatDateDivider(message.createdAt)}
                          </div>
                        )}
                        
                        <div className={`message ${isCurrentUser ? 'outgoing' : 'incoming'}`}>
                          {!isCurrentUser && (
                            <div className="sender-name">{message.sender.name}</div>
                          )}
                          <div className="message-content">
                            <p>{message.content}</p>
                            <div className="message-meta">
                              <span className="timestamp">
                                {formatMessageTime(message.createdAt)}
                              </span>
                              {isCurrentUser && (
                                <span className="read-status">
                                  {isMessageRead(message) ? (
                                    <i className="fas fa-check-double"></i>
                                  ) : (
                                    <i className="fas fa-check"></i>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
              {renderTypingIndicator()}
            </div>
            
            {/* Message input form */}
            <form className="message-form" onSubmit={sendMessage}>
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-btn" disabled={!message.trim()}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="empty-state">
              <i className="fas fa-comments"></i>
              <h3>Select a conversation or start a new chat</h3>
              <button onClick={toggleNewChatModal} className="new-chat-btn">
                <i className="fas fa-plus"></i> New Chat
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>New Conversation</h2>
              <button className="close-btn" onClick={toggleNewChatModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="search-container">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="search-input"
                />
                <button onClick={searchUsers} className="search-btn">
                  <i className="fas fa-search"></i>
                </button>
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="selected-users">
                  <h3>Selected ({selectedUsers.length})</h3>
                  <div className="selected-users-list">
                    {selectedUsers.map(selectedUser => (
                      <div key={selectedUser._id} className="selected-user-chip">
                        <span>{selectedUser.name}</span>
                        <button 
                          onClick={() => toggleUserSelection(selectedUser)}
                          className="remove-user-btn"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="search-results">
                {searchResults.length > 0 ? (
                  searchResults.map(u => (
                    <div 
                      key={u._id}
                      className={`user-item ${
                        selectedUsers.some(selectedUser => selectedUser._id === u._id) ? 'selected' : ''
                      }`}
                      onClick={() => toggleUserSelection(u)}
                    >
                      <div className="user-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="user-info">
                        <h4>{u.name}</h4>
                        <p>{u.email}</p>
                      </div>
                      <div className="checkbox">
                        {selectedUsers.some(selectedUser => selectedUser._id === u._id) && (
                          <i className="fas fa-check-circle"></i>
                        )}
                      </div>
                    </div>
                  ))
                ) : searchQuery ? (
                  <div className="no-results">No users found</div>
                ) : (
                  <div className="search-prompt">Search for users to chat with</div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={toggleNewChatModal}
              >
                Cancel
              </button>
              <button
                className="create-btn"
                onClick={createNewConversation}
                disabled={selectedUsers.length === 0}
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;