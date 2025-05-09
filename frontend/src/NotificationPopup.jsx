import React, { useState, useEffect } from 'react';
import './NotificationPopup.css';

const NotificationPopup = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications when the component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      // Set up polling for new notifications every 30 seconds
      const intervalId = setInterval(fetchNotifications, 30000);
      
      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [userId]);

  // Fetch all unread notifications for the user
  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/notifications/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
      }
      
      const notificationsData = await response.json();
      
      // Filter for unread notifications
      const unreadNotifications = notificationsData.filter(notification => !notification.read);
      
      setNotifications(unreadNotifications);
      
      // If there are unread violation notifications, show the most recent one
      const violationNotifications = unreadNotifications.filter(
        notification => notification.type === 'violation'
      );
      
      if (violationNotifications.length > 0) {
        // Sort by createdAt (newest first) just to be sure
        violationNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const latestViolation = violationNotifications[0]; // The most recent one
        setActiveNotification(latestViolation);
        setShowNotification(true);
      } else if (unreadNotifications.length > 0 && !activeNotification) {
        // If there are other unread notifications and nothing is currently displayed
        unreadNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setActiveNotification(unreadNotifications[0]);
        setShowNotification(true);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(notifications.filter(notification => notification._id !== notificationId));
      
      // Close notification popup
      setShowNotification(false);
      setActiveNotification(null);
      
      // Check if there are other notifications to show
      setTimeout(() => {
        const remainingNotifications = notifications.filter(notification => notification._id !== notificationId);
        if (remainingNotifications.length > 0) {
          setActiveNotification(remainingNotifications[0]);
          setShowNotification(true);
        }
      }, 300); // Small delay for better UX
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Could not mark notification as read. Please try again.');
    }
  };

  // Close notification without marking as read
  const closeNotification = () => {
    setShowNotification(false);
    
    // After animation completes, check for more notifications
    setTimeout(() => {
      if (notifications.length > 1 && activeNotification) {
        const nextNotificationIndex = notifications.findIndex(n => n._id === activeNotification._id) + 1;
        if (nextNotificationIndex < notifications.length) {
          setActiveNotification(notifications[nextNotificationIndex]);
          setShowNotification(true);
        } else {
          setActiveNotification(notifications[0]);
          setShowNotification(true);
        }
      } else {
        setActiveNotification(null);
      }
    }, 300);
  };

  // Calculate notification time relative to now (e.g., "2 hours ago")
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHr > 0) {
      return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };

  if (loading || !showNotification || !activeNotification) {
    return null;
  }

  return (
    <div className={`notification-popup ${showNotification ? 'show' : ''}`}>
      <div className={`notification-content ${activeNotification.type}`}>
        <div className="notification-icon">
          {activeNotification.type === 'violation' ? '⚠️' : 
           activeNotification.type === 'system' ? '🔔' : 'ℹ️'}
        </div>
        <div className="notification-body">
          <h4>{activeNotification.title}</h4>
          <p>{activeNotification.message}</p>
          {activeNotification.details && (
            <p className="notification-details">{activeNotification.details}</p>
          )}
          <span className="notification-time">{getRelativeTime(activeNotification.createdAt)}</span>
        </div>
        <div className="notification-actions">
          <button 
            onClick={() => markAsRead(activeNotification._id)}
            className="btn-mark-read"
          >
            Mark as Read
          </button>
          <button 
            onClick={closeNotification}
            className="btn-close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Badge indicating number of unread notifications */}
      {notifications.length > 1 && (
        <div className="notification-counter">
          {notifications.length}
        </div>
      )}
    </div>
  );
};

export default NotificationPopup;