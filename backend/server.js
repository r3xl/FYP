import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';
import setupSocketIO from './socketConfig.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';  
import contactRoutes from './routes/contact.js'; // Updated to ES6 import

// Configure environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set up Socket.IO
const io = setupSocketIO(server);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/user')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Check request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);  // Add notification routes
app.use('/api/contact', contactRoutes); // Add contact routes

// Make socket.io instance available to the request object
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

app.get('/api/cars/car-listings', async (req, res) => {
  try {
    const carListings = await CarListing.find()
      .populate('owner', 'name firstName lastName') // Populate owner information
      .sort({ createdAt: -1 });
    
    // Process the data to include ownerName
    const processedListings = carListings.map(car => ({
      ...car.toObject(),
      ownerName: car.owner?.name || 
                 (car.firstName && car.lastName ? `${car.firstName} ${car.lastName}` : null) ||
                 car.owner?.firstName + ' ' + car.owner?.lastName ||
                 'Seller'
    }));
    
    res.json(processedListings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching car listings', error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));