import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    // Check for admin token (used in AdminPanel.jsx)
    const adminToken = req.headers.authorization?.split(' ')[1] || '';
    
    // Handle admin authentication
    if (req.headers['x-admin-auth'] === 'true') {
      // For admin panel requests, we'll check the adminToken from localStorage
      console.log('Admin auth requested');
      
      if (adminToken === 'admin-special-token' || (adminToken && adminToken.includes('admin-signature'))) {
        // This is a hardcoded admin check for the demo
        // In production, you would verify a proper JWT token with admin role
        console.log('Valid admin token detected');
        req.user = {
          userId: 'admin-user-id',
          role: 'admin'
        };
        return next();
      } else {
        console.log('Invalid admin token:', adminToken);
        return res.status(403).json({
          success: false,
          message: 'Admin access denied - invalid token'
        });
      }
    }
    
    // Regular user authentication
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      
      // Set base user data in request object
      req.user = {
        userId: decoded.userId,
        role: decoded.role || 'user'
      };
      
      // Get the user from database to verify current role
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        console.log('User not found');
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Update role from database (in case it was changed since token was issued)
      req.user.role = user.role || 'user';
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server authentication error'
    });
  }
};

// Middleware to check if user is an admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin only.' 
    });
  }
};

export default auth;