// models/CarListing.js
import mongoose from 'mongoose';

const CarListingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  carType: { type: String, required: true },
  brand: { type: String, required: true },
  details: { type: String, required: true },
  images: [{ type: String }], // Store image paths
  model3d: { type: String }, // Store 3D model path if any
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CarListing', CarListingSchema);