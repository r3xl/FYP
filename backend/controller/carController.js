import CarListing from '../models/CarListing.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a new car listing
export const createCarListing = async (req, res) => {
  try {
    // Log incoming request to help with debugging
    console.log('Creating car listing with body:', req.body);
    console.log('Files received:', req.files);
    
    // Extract file paths
    const imagePaths = req.files?.images?.map(img => `/uploads/${img.filename}`) || [];
    const model3dPath = req.files?.model3d?.[0] ? `/uploads/${req.files.model3d[0].filename}` : null;
    
    // Make sure we have the user ID from the auth middleware
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User authentication failed' 
      });
    }
    
    // Create new car listing
    const newListing = new CarListing({
      owner: req.user.userId,
      ownerName: req.body.firstName + ' ' + req.body.lastName,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      carType: req.body.topic,
      brand: req.body.description,
      carName: req.body.carName, 
      details: req.body.message,
      images: imagePaths,
      model3d: model3dPath
    });
    
    await newListing.save();
    
    res.status(201).json({ 
      success: true,
      message: 'Car listing created successfully',
      listing: newListing
    });
  } catch (error) {
    console.error('Error creating car listing:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating car listing: ' + error.message
    });
  }
};

// Get all car listings
export const getAllCarListings = async (req, res) => {
  try {
    const listings = await CarListing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Error fetching car listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single car listing
export const getCarListing = async (req, res) => {
  try {
    const listing = await CarListing.findById(req.params.id)
      .populate('owner', '_id name'); // Only populate ID and name for security

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Single car listing fetched successfully',
      listing,
    });
  } catch (error) {
    console.error('Error fetching car listing:', error);
    res.status(500).json({ message: 'Server error fetching listing: ' + error.message });
  }
};


// Update a car listing
export const updateCarListing = async (req, res) => {
  try {
    const listing = await CarListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user owns this listing or is an admin
    const isAdmin = req.user.role === 'admin' || req.headers['x-admin-auth'] === 'true' || req.query.isAdmin === 'true';
    if (listing.owner.toString() !== req.user.userId && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    
    // Update fields
    const updatedData = {
      firstName: req.body.firstName || listing.firstName,
      lastName: req.body.lastName || listing.lastName,
      email: req.body.email || listing.email,
      phone: req.body.phone || listing.phone,
      carType: req.body.topic || listing.carType,
      brand: req.body.description || listing.brand,
      carName: req.body.carName || listing.carName, // Add this line
      details: req.body.message || listing.details,
    };
    
    const updatedListing = await CarListing.findByIdAndUpdate(
      req.params.id, 
      updatedData,
      { new: true }
    );
    
    
    res.json({ 
      success: true,
      message: 'Listing updated successfully',
      listing: updatedListing 
    });
  } catch (error) {
    console.error('Error updating car listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a car listing
export const deleteCarListing = async (req, res) => {
  try {
    console.log('Delete car listing called with params:', req.params);
    console.log('User info:', req.user);
    console.log('Admin header present:', req.headers['x-admin-auth'] === 'true');
    console.log('Admin query param present:', req.query.isAdmin === 'true');
    
    const listing = await CarListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ 
        success: false,
        message: 'Listing not found' 
      });
    }
    
    // Check authentication first
    if (!req.user) {
      console.log('No user object found in request');
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    
    if (!req.user.userId) {
      console.log('No userId found in user object');
      return res.status(401).json({ 
        success: false,
        message: 'User ID not found in authentication' 
      });
    }
    
    // Check if user owns this listing or is an admin
    const isAdmin = req.user.role === 'admin';
    const isOwner = listing.owner.toString() === req.user.userId;
    
    console.log('Is admin?', isAdmin);
    console.log('Is owner?', isOwner);
    console.log('Listing owner:', listing.owner.toString());
    console.log('User ID:', req.user.userId);
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized - you must be the listing owner or an admin' 
      });
    }
    
    await CarListing.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'Listing deleted successfully',
      deletedId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting car listing:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};

// Special endpoint for admin to delete a listing (can be added to routes)
export const adminDeleteListing = async (req, res) => {
  try {
    console.log('Admin delete endpoint called with body:', req.body);
    console.log('User role:', req.user?.role);
    
    const { listingId, violationReason, violationDetails } = req.body;
    
    if (!listingId) {
      return res.status(400).json({ 
        success: false,
        message: 'Listing ID is required' 
      });
    }
    
    // Check authentication
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    
    const listing = await CarListing.findById(listingId);
    
    if (!listing) {
      return res.status(404).json({ 
        success: false,
        message: 'Listing not found' 
      });
    }
    
    // Check if user has admin role (we've already verified this in the auth middleware)
    if (req.user.role !== 'admin') {
      console.log('Admin access denied for user role:', req.user.role);
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }
    
    // Store owner info before deletion for notification
    const listingOwner = listing.owner;
    
    // Delete the listing
    await CarListing.findByIdAndDelete(listingId);
    
    // Send notification to the owner (if needed)
    try {
      // You could implement the notification logic here
      console.log(`Should send notification to user ${listingOwner} about listing removal`);
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Continue with the deletion process even if notification fails
    }
    
    // Log successful deletion
    console.log(`Admin successfully deleted listing ${listingId} with reason: ${violationReason}`);
    
    res.status(200).json({ 
      success: true,
      message: 'Listing deleted successfully by admin',
      deletedId: listingId
    });
  } catch (error) {
    console.error('Error in admin delete car listing:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error: ' + error.message 
    });
  }
};