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
    const listing = await CarListing.findById(req.params.id);

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
    
    // Check if user owns this listing
    if (listing.owner.toString() !== req.user.userId) {
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
    const listing = await CarListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user owns this listing
    if (listing.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await CarListing.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'Listing deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting car listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
};