import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth, isAdmin } from '../routes/auth.js';
import { 
  createCarListing, 
  getAllCarListings,
  getCarListing,
  updateCarListing,
  deleteCarListing,
  adminDeleteListing
} from '../controller/carController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files as static files
router.use('/uploads', express.static(uploadsDir));
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// File upload middleware
const fileFields = [
  { name: 'images', maxCount: 10 },
  { name: 'model3d', maxCount: 1 }
];



// Routes
router.post('/car-listings', auth, upload.fields(fileFields), createCarListing);
router.get('/car-listings', getAllCarListings);
router.get('/car-listings/:id', getCarListing);
router.put('/car-listings/:id', auth, updateCarListing);
router.delete('/car-listings/:id', auth, deleteCarListing);

// Admin routes - use both auth and isAdmin middlewares
router.post('/admin/delete-listing', [auth, isAdmin], adminDeleteListing);

export default router;