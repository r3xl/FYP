import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import './NotificationMenu.css';

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  
  const API_URL = 'http://localhost:5000/api';
  
  // Setup headers with token for API requests
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  // Fetch notifications on component mount
  useEffect(() => {
    if (token && userId) {
      fetchNotifications();
    }
  }, [token, userId]);
  
  // Set up click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Set up socket.io listener for new notifications (assuming socket is passed as a prop)
  useEffect(() => {
    // Listen for new notification events
    const setupSocketListeners = () => {
      const socket = io('http://localhost:5000', {
        auth: { token: `Bearer ${token}` }
      });
      
      socket.on('new-notification', (notification) => {
        // Only add if it's for this user
        if (notification.userId === userId) {
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      });
      
      return socket;
    };
    
    let socket;
    if (token && userId) {
      socket = setupSocketListeners();
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token, userId]);
  
  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/notifications/user/${userId}`, config);
      
      setNotifications(response.data);
      const unread = response.data.filter(notification => !notification.read).length;
      setUnreadCount(unread);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, config);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/user/${userId}/read-all`, {}, config);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Handle notification click - mark as read and navigate if needed
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    // Navigate based on the notification type and properties
    if (notification.type === 'info' && notification.carId) {
      // Find or create conversation and navigate to it
      try {
        const response = await axios.get(`${API_URL}/notifications/${notification._id}/conversation`, config);
        
        if (response.data.conversationId) {
          navigate(`/chat`, { 
            state: { 
              openConversation: response.data.conversationId,
              carInfo: response.data.carInfo
            } 
          });
        }
      } catch (error) {
        console.error('Error handling notification click:', error);
      }
    }
    
    // Close the menu after handling the click
    setIsOpen(false);
  };
  
  // Format the notification time
  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    
    // If it's today, just show the time
    if (notificationDate.toDateString() === now.toDateString()) {
      return format(notificationDate, 'h:mm a');
    }
    
    // If it's this year, show month and day
    if (notificationDate.getFullYear() === now.getFullYear()) {
      return format(notificationDate, 'MMM d');
    }
    
    // Otherwise show full date
    return format(notificationDate, 'MMM d, yyyy');
  };
  
  // Toggle the notification menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="notification-menu-container" ref={menuRef}>
      <button 
        className="notification-bell" 
        onClick={toggleMenu}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read" 
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {isLoading ? (
              <div className="loading">Loading notifications...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">No notifications yet</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {notification.type === 'violation' && <i className="fas fa-exclamation-triangle"></i>}
                    {notification.type === 'system' && <i className="fas fa-cog"></i>}
                    {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;