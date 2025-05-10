import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import NotificationPopup from './NotificationPopup';

const UserLayout = ({ children }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get the userId from localStorage when component mounts
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user._id) {
      setUserId(user._id);
    }
  }, []);

  return (
    <>
      {/* Render the children or Outlet components */}
      {children || <Outlet />}
      
      {/* Render the NotificationPopup if userId is available */}
      {userId && <NotificationPopup userId={userId} />}
    </>
  );
};

export default UserLayout;