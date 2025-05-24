import mongoose from 'mongoose';

const CarListingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  carType: { type: String, required: true },
  brand: { type: String, required: true },
  carName: { type: String }, 
  details: { type: String, required: true },
  images: [{ type: String }], 
  model3d: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

// Export the model but check if it's already been registered to avoid the error
const CarListing = mongoose.models.CarListing || mongoose.model('CarListing', CarListingSchema);

export default CarListing;