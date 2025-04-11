import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './BuyNow.css';
import ThreeJSModelViewer from './ThreeJSModelViewer';


const BuyNow = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [carListings, setCarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showModelViewer, setShowModelViewer] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'creditCard',
  });
  const [errors, setErrors] = useState({});
  const [paymentStep, setPaymentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [editFormData, setEditFormData] = useState({
    brand: '',
    carType: '',
    carName: '', 
    details: '',
    email: '',
    phone: ''
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    brands: [],
    carTypes: [],
    has3DModel: null // null means don't filter, true means only with 3D, false means only without 3D
  });
  const [sortOption, setSortOption] = useState('sort');
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCarTypes, setAvailableCarTypes] = useState([]);

  // All Brands and Car Types 
  const allBrandsFromSellPage = [
    "Toyota", "Honda", "Ford", "BMW", "Audi", "Mercedes-Benz", "Hyundai", "Nissan", "Chevrolet", "Volkswagen",
    "Lexus", "Mazda", "Kia", "Jeep", "Subaru", "Tesla", "Volvo", "Porsche", "Land Rover", "Jaguar", "Acura", 
    "Infiniti", "Cadillac", "Buick", "Mini", "Other"
  ];

  const allCarTypesFromSellPage = [
    "Sedan", "SUV", "Sports Car", "Luxury", "Pickup Truck", "Hatchback", "Convertible", "Minivan", "Electric Vehicle", 
    "Hybrid", "Compact", "Coupe", "Wagon", "Other"
  ];

  
  // Add state for user info
  const [userData, setUserData] = useState({
    userId: '',
    userName: '',
    token: ''
  });

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const getFilteredListings = () => {
    // First filter by search term
    let filtered = carListings;
    if (searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = carListings.filter(car => 
        car.brand.toLowerCase().includes(searchTermLower) ||
        (car.carName && car.carName.toLowerCase().includes(searchTermLower))
      );
    }
    
    // Apply brand filters if any are selected
    if (filters.brands.length > 0) {
      filtered = filtered.filter(car => filters.brands.includes(car.brand));
    }
    
    // Apply car type filters if any are selected
    if (filters.carTypes.length > 0) {
      filtered = filtered.filter(car => filters.carTypes.includes(car.carType));
    }
    
    // Apply 3D model filter if selected
    if (filters.has3DModel !== null) {
      filtered = filtered.filter(car => (car.model3d != null) === filters.has3DModel);
    }
    
    return filtered;
  };

  const toggleBrandFilter = (brand) => {
    setFilters(prevFilters => {
      const brandIndex = prevFilters.brands.indexOf(brand);
      let updatedBrands;
      
      if (brandIndex === -1) {
        // Add the brand to filters
        updatedBrands = [...prevFilters.brands, brand];
      } else {
        // Remove the brand from filters
        updatedBrands = prevFilters.brands.filter(b => b !== brand);
      }
      
      return {
        ...prevFilters,
        brands: updatedBrands
      };
    });
  };
  
  const toggleCarTypeFilter = (carType) => {
    setFilters(prevFilters => {
      const typeIndex = prevFilters.carTypes.indexOf(carType);
      let updatedTypes;
      
      if (typeIndex === -1) {
        // Add the car type to filters
        updatedTypes = [...prevFilters.carTypes, carType];
      } else {
        // Remove the car type from filters
        updatedTypes = prevFilters.carTypes.filter(t => t !== carType);
      }
      
      return {
        ...prevFilters,
        carTypes: updatedTypes
      };
    });
  };
  
  const toggle3DModelFilter = (value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      has3DModel: prevFilters.has3DModel === value ? null : value
    }));
  };
  
  const clearAllFilters = () => {
    setFilters({
      brands: [],
      carTypes: [],
      has3DModel: null
    });
  };

  // Get user info from localStorage in useEffect
  useEffect(() => {
    // When retrieving from localStorage, make sure the key matches what was set during login
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('name');
    const token = localStorage.getItem('token');
    
    setUserData({
      userId: userId,
      userName: name,
      token
    });
  }, []);

  function navigateToPopular() {
    // Navigate programmatically
    navigate('/homepage#popular');
    // Manually scroll after a short delay
    setTimeout(() => {
      const element = document.getElementById('popular');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  function navigateToAbout() {
    // Navigate programmatically
    navigate('/homepage#about');
    // Manually scroll after a short delay
    setTimeout(() => {
      const element = document.getElementById('about');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  function navigateToContact() {
    // Navigate programmatically
    navigate('/homepage#contact');
    // Manually scroll after a short delay
    setTimeout(() => {
      const element = document.getElementById('contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    setUserData({
      userId: '',
      userName: '',
      token: ''
    });
    navigate('/login');
  };

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Fetch car listings on component mount
  useEffect(() => {
    const fetchCarListings = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/car-listings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch car listings');
        }
        
        const data = await response.json();
        setCarListings(data);

        setAvailableBrands(allBrandsFromSellPage);
        setAvailableCarTypes(allCarTypesFromSellPage);        
        
        // Check if we have a selected car ID from navigation state
        if (location.state && location.state.selectedCarId) {
          // Find the car with the matching ID
          const selectedCar = data.find(car => car._id === location.state.selectedCarId);
          if (selectedCar) {
            // Open the details modal for this car
            setSelectedCar(selectedCar);
            setActiveImageIndex(0);
            setShowModelViewer(false);
            setShowDetailsModal(true);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching car listings:', error);
        setError('Failed to load car listings. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCarListings();
  }, [location.state]); 

  // Update the isOwner function to use userData.userId
  const isOwner = (listing) => {
    if (!listing || !listing.owner || !userData.userId) {
      return false;
    }
    
    // Convert both to strings for comparison to avoid type mismatches
    const listingOwnerId = String(listing.owner);
    const currentUserId = String(userData.userId);
    
    return listingOwnerId === currentUserId;
  };

  // Function to open car details
  const openCarDetails = (car) => {
    setSelectedCar(car);
    setActiveImageIndex(0); // Reset image index when opening details
    setShowModelViewer(false); // Default to images view
    setShowDetailsModal(true);
  };

  // Function to close car details modal
  const closeCarDetails = () => {
    setShowDetailsModal(false);
    setSelectedCar(null);
  };

  // Function to handle edit
  const handleEdit = (car, e) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    
    if (isOwner(car)) {
      setSelectedCar(car);
      setEditingCar(car);
      setEditFormData({
        brand: car.brand,
        carType: car.carType,
        carName: car.carName || '', 
        details: car.details,
        email: car.email,
        phone: car.phone
      });
      setEditMode(true);
      setShowDetailsModal(true);
    } else {
      alert('You can only edit your own listings');
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const saveEditedCar = async () => {
    if (!editingCar || !userData.token) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/car-listings/${editingCar._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          firstName: editingCar.firstName,
          lastName: editingCar.lastName,
          topic: editFormData.carType,
          description: editFormData.brand,
          carName: editFormData.carName, // Add this line
          message: editFormData.details,
          email: editFormData.email,
          phone: editFormData.phone
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update car listing');
      }
      
      // Get the updated car data from the response
      const updatedCar = await response.json();
      
      // Create an updated car object with all the necessary fields
      const updatedCarWithAllFields = {
        ...editingCar,
        brand: editFormData.brand,
        carType: editFormData.carType,
        carName: editFormData.carName, // Add this line
        details: editFormData.details,
        email: editFormData.email,
        phone: editFormData.phone
      };
      
      // Update the car in the listings array
      setCarListings(carListings.map(car => 
        car._id === editingCar._id ? updatedCarWithAllFields : car
      ));
      
      // Update the selected car if it's the one being edited
      if (selectedCar && selectedCar._id === editingCar._id) {
        setSelectedCar(updatedCarWithAllFields);
      }
      
      // Exit edit mode
      setEditMode(false);
      setEditingCar(null);
      
      // Show success notification
      setNotificationMessage('Car listing updated successfully!');
      setNotificationType('success');
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating car listing:', error);
      
      // Show error notification
      setNotificationMessage('Failed to update car listing. Please try again.');
      setNotificationType('error');
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingCar(null);
  };

// Function to confirm delete
const confirmDelete = (car, e) => {
  if (e) e.stopPropagation(); // Prevent event bubbling
  
  if (isOwner(car)) {
    setCarToDelete(car);
    
    // Close the details modal first
    setShowDetailsModal(false);
    
    // Show the delete confirmation after a brief delay
    setTimeout(() => {
      setShowDeleteConfirm(true);
    }, 100); // Small delay to ensure modal closes first
  } else {
    alert('You can only delete your own listings');
  }
};
  
  // Function to cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCarToDelete(null);
  };

  // Function to handle delete
  const handleDelete = async () => {
    if (!carToDelete || !userData.token) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/car-listings/${carToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete car listing');
      }
      
      // Remove deleted car from list
      setCarListings(carListings.filter(car => car._id !== carToDelete._id));
      setShowDeleteConfirm(false);
      setCarToDelete(null);
      
      // If we're deleting the currently selected car, close the modal
      if (selectedCar && selectedCar._id === carToDelete._id) {
        closeCarDetails();
      }
    } catch (error) {
      console.error('Error deleting car listing:', error);
      alert('Failed to delete car listing. Please try again.');
    }
  };

  // Function to navigate through images
  const navigateImages = (direction) => {
    if (!selectedCar || !selectedCar.images || selectedCar.images.length === 0) return;
    
    if (direction === 'next') {
      setActiveImageIndex((prevIndex) => 
        prevIndex === selectedCar.images.length - 1 ? 0 : prevIndex + 1
      );
    } else {
      setActiveImageIndex((prevIndex) => 
        prevIndex === 0 ? selectedCar.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Toggle between images and 3D model viewer
  const toggleModelViewer = () => {
    setShowModelViewer(!showModelViewer);
  };

  // Check if car has a 3D model
  const has3DModel = (car) => {
    return car && car.model3d;
  };

  // Open payment modal
  const openPaymentModal = () => {
    // Close the details modal first to prevent nested modals
    setShowDetailsModal(false);
    
    // Reset payment form
    setPaymentStep(1);
    setPaymentInfo({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zip: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      paymentMethod: 'creditCard',
    });
    setErrors({});
    
    // Show payment modal after a brief delay to ensure smooth transition
    setTimeout(() => {
      setShowPaymentModal(true);
    }, 100);
  };

  // Close payment modal
  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  // Handle payment input changes
  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo({
      ...paymentInfo,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate personal info (step 1)
  const validatePersonalInfo = () => {
    const newErrors = {};
    
    if (!paymentInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!paymentInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(paymentInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!paymentInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!paymentInfo.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!paymentInfo.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!paymentInfo.zip.trim()) {
      newErrors.zip = 'ZIP code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate payment info (step 2)
  const validatePaymentInfo = () => {
    const newErrors = {};
    
    if (paymentInfo.paymentMethod === 'creditCard') {
      if (!paymentInfo.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Card number should be 16 digits';
      }
      
      if (!paymentInfo.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expiryDate)) {
        newErrors.expiryDate = 'Format should be MM/YY';
      }
      
      if (!paymentInfo.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
        newErrors.cvv = 'CVV should be 3 or 4 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step in payment process
  const handleNextStep = () => {
    if (paymentStep === 1 && validatePersonalInfo()) {
      setPaymentStep(2);
    }
  };

  // Handle previous step in payment process
  const handlePrevStep = () => {
    if (paymentStep === 2) {
      setPaymentStep(1);
    }
  };

  // Handle form submission
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    if (paymentStep === 2 && validatePaymentInfo()) {
      setIsSubmitting(true);
      
      // Simulate payment processing
      try {
        // Here you would typically make an API call to process the payment
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        alert(`Payment successful! You've purchased ${selectedCar.brand} ${selectedCar.carType}`);
        setIsSubmitting(false);
        closePaymentModal();
      } catch (error) {
        console.error('Payment error:', error);
        setErrors({ submit: 'Payment failed. Please try again.' });
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="buynow-container">
    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <div className="modal-overlay delete-confirm-overlay">
        <div className="delete-modal">
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
          <div className="delete-actions">
            <button className="btn-outline" onClick={cancelDelete}>Cancel</button>
            <button className="btn-danger" onClick={handleDelete}>Delete Listing</button>
          </div>
        </div>
      </div>
    )}
      
      {/* Payment Modal */}
      {showPaymentModal && selectedCar && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <span className="close-modal" onClick={closePaymentModal}>&times;</span>
            <h2>Purchase {selectedCar.brand.toUpperCase()} {selectedCar.carType}</h2>
            
            <div className="payment-steps">
              <div className={`step ${paymentStep === 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-text">Personal Information</span>
              </div>
              <div className={`step ${paymentStep === 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-text">Payment Details</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmitPayment} className="payment-form">
              {/* Step 1: Personal Information */}
              {paymentStep === 1 && (
                <div className="payment-step-content">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={paymentInfo.fullName}
                      onChange={handlePaymentInputChange}
                      className={errors.fullName ? 'error' : ''}
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={paymentInfo.email}
                      onChange={handlePaymentInputChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={paymentInfo.phone}
                      onChange={handlePaymentInputChange}
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={paymentInfo.address}
                      onChange={handlePaymentInputChange}
                      className={errors.address ? 'error' : ''}
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={paymentInfo.city}
                        onChange={handlePaymentInputChange}
                        className={errors.city ? 'error' : ''}
                      />
                      {errors.city && <span className="error-message">{errors.city}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="zip">ZIP Code</label>
                      <input
                        type="text"
                        id="zip"
                        name="zip"
                        value={paymentInfo.zip}
                        onChange={handlePaymentInputChange}
                        className={errors.zip ? 'error' : ''}
                      />
                      {errors.zip && <span className="error-message">{errors.zip}</span>}
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={closePaymentModal}>Cancel</button>
                    <button type="button" className="btn-primary" onClick={handleNextStep}>Next</button>
                  </div>
                </div>
              )}
              
              {/* Step 2: Payment Information */}
              {paymentStep === 2 && (
                <div className="payment-step-content">
                  <div className="payment-methods">
                    <h3>Payment Method</h3>
                    <div className="payment-method-options">
                      <div className="payment-method-option">
                        <input
                          type="radio"
                          id="creditCard"
                          name="paymentMethod"
                          value="creditCard"
                          checked={paymentInfo.paymentMethod === 'creditCard'}
                          onChange={handlePaymentInputChange}
                        />
                        <label htmlFor="creditCard">Credit Card</label>
                      </div>
                      <div className="payment-method-option">
                        <input
                          type="radio"
                          id="paypal"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentInfo.paymentMethod === 'paypal'}
                          onChange={handlePaymentInputChange}
                        />
                        <label htmlFor="paypal">PayPal</label>
                      </div>
                      <div className="payment-method-option">
                        <input
                          type="radio"
                          id="bankTransfer"
                          name="paymentMethod"
                          value="bankTransfer"
                          checked={paymentInfo.paymentMethod === 'bankTransfer'}
                          onChange={handlePaymentInputChange}
                        />
                        <label htmlFor="bankTransfer">Bank Transfer</label>
                      </div>
                    </div>
                  </div>
                  
                  {paymentInfo.paymentMethod === 'creditCard' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={paymentInfo.cardNumber}
                          onChange={handlePaymentInputChange}
                          placeholder="1234 5678 9012 3456"
                          className={errors.cardNumber ? 'error' : ''}
                        />
                        {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiryDate">Expiry Date</label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={paymentInfo.expiryDate}
                            onChange={handlePaymentInputChange}
                            placeholder="MM/YY"
                            className={errors.expiryDate ? 'error' : ''}
                          />
                          {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="cvv">CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={paymentInfo.cvv}
                            onChange={handlePaymentInputChange}
                            placeholder="123"
                            className={errors.cvv ? 'error' : ''}
                          />
                          {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {paymentInfo.paymentMethod === 'paypal' && (
                    <div className="payment-method-info">
                      <p>You will be redirected to PayPal to complete your purchase.</p>
                    </div>
                  )}
                  
                  {paymentInfo.paymentMethod === 'bankTransfer' && (
                    <div className="payment-method-info">
                      <p>Bank transfer details will be emailed to you after confirmation.</p>
                    </div>
                  )}
                  
                  {errors.submit && <div className="error-message form-submit-error">{errors.submit}</div>}
                  
                  <div className="form-actions">
                    <button type="button" className="btn-outline" onClick={handlePrevStep}>Back</button>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Complete Purchase'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      
      {/* Car Details Modal */}
      {showDetailsModal && selectedCar && (
        <div className="modal-overlay" onClick={closeCarDetails}>
        <div className="car-details-modal" onClick={e => e.stopPropagation()}>
          <span className="close-modal" onClick={closeCarDetails}>&times;</span>
          <h2>{selectedCar.brand.toUpperCase()} {selectedCar.carName || ''}</h2>


      
          
          {editMode ? (
            /* Edit Form */
            <div className="edit-form-container">
              <h3>Edit Car Listing</h3>
              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={editFormData.brand}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="carType">Car Type</label>
                <input
                  type="text"
                  id="carType"
                  name="carType"
                  value={editFormData.carType}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="carName">Car Name</label>
                <input
                  type="text"
                  id="carName"
                  name="carName"
                  value={editFormData.carName}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="details">Details</label>
                <textarea
                  id="details"
                  name="details"
                  value={editFormData.details}
                  onChange={handleEditInputChange}
                  rows="5"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="edit-form-actions">
                <button className="btn-outline" onClick={cancelEdit}>Cancel</button>
                <button className="btn-primary" onClick={saveEditedCar}>Save Changes</button>
              </div>
            </div>
          ) : (
            /* Regular car details view */
            <>
              {/* Toggle between images and 3D model if available */}
              {has3DModel(selectedCar) && (
                <div className="view-toggle-buttons">
                  <button 
                    className={`view-toggle-btn ${!showModelViewer ? 'active' : ''}`} 
                    onClick={() => setShowModelViewer(false)}
                  >
                    Photos
                  </button>
                  <button 
                    className={`view-toggle-btn ${showModelViewer ? 'active' : ''}`} 
                    onClick={() => setShowModelViewer(true)}
                  >
                    3D Model
                  </button>
                </div>
              )}
              
              {/* 3D Model Viewer */}
              {showModelViewer && has3DModel(selectedCar) ? (
                <div className="model-viewer-container">
                  <ThreeJSModelViewer modelUrl={`http://localhost:5000${selectedCar.model3d}`} />
                  <div className="model-viewer-instructions">
                    <p>Click and drag to rotate | Scroll to zoom | Right-click to pan</p>
                  </div>
                </div>
              ) : (
                /* Image carousel */
                <div className="car-details-images">
                  {selectedCar.images && selectedCar.images.length > 0 ? (
                    <>
                      <div className="car-image-carousel">
                        <button 
                          className="carousel-button prev" 
                          onClick={(e) => {
                            e.preventDefault();
                            navigateImages('prev');
                          }}
                        >
                          ‹
                        </button>
                      
                        <div className="carousel-image-container">
                          <img 
                            src={`http://localhost:5000${selectedCar.images[activeImageIndex]}`} 
                            alt={`${selectedCar.brand} ${activeImageIndex + 1}`} 
                          />
                          <div className="image-counter">
                            {activeImageIndex + 1} / {selectedCar.images.length}
                          </div>
                        </div>
                        
                        <button 
                          className="carousel-button next" 
                          onClick={(e) => {
                            e.preventDefault();
                            navigateImages('next');
                          }}
                        >
                          ›
                        </button>
                      </div>
                      
                      {/* Thumbnail navigation */}
                      {selectedCar.images.length > 1 && (
                        <div className="image-thumbnails">
                          {selectedCar.images.map((image, index) => (
                            <div 
                              key={index} 
                              className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                              onClick={() => setActiveImageIndex(index)}
                            >
                              <img 
                                src={`http://localhost:5000${image}`} 
                                alt={`${selectedCar.brand} thumbnail ${index + 1}`} 
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="car-detail-image no-image">
                      <span>No images available</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="car-details-info">
                <div className="detail-section">
                  <h3>Car Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedCar.carType}</span>
                  </div>
                  <div className="detail-row">
                  <span className="detail-label">Model:</span>
                  <span className="detail-value">{selectedCar.carName || 'Not specified'}</span>
                </div>
                  <div className="detail-row">
                    <span className="detail-label">Brand:</span>
                    <span className="detail-value">{selectedCar.brand}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Full Description</h3>
                  <p className="car-description">{selectedCar.details}</p>
                </div>
                
                <div className="detail-section">
                  <h3>Contact Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Seller:</span>
                    <span className="detail-value">{selectedCar.ownerName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedCar.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedCar.phone}</span>
                  </div>
                </div>
              </div>
              
              {/* Action buttons - for owner and buyers */}
              <div className="car-details-actions">
                {isOwner(selectedCar) ? (
                  <>
                    <button className="btn-primary" onClick={() => handleEdit(selectedCar)}>Edit Listing</button>
                    <button className="btn-danger" onClick={() => confirmDelete(selectedCar)}>Delete Listing</button>
                  </>
                ) : (
                  <button className="btn-purchase" onClick={openPaymentModal}>Buy Now</button>
                )}
              </div>
            </>
          )}
        </div>
        </div>
      )}

      {/* Notification Popup */}
      {showNotification && (
        <div className={`notification-popup ${notificationType}`}>
          <span className="notification-message">{notificationMessage}</span>
          <button className="close-notification" onClick={() => setShowNotification(false)}>×</button>
        </div>
      )}

      {/* Header - Matched to Homepage */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🚗</span>
          AutoVision
        </div>
        <nav className="navbar">
          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}></span>
          </div>
          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <li><Link to="/homepage">Home</Link></li>
            <li><a onClick={navigateToPopular}>Popular</a></li>
            <li><a onClick={navigateToContact}>Contact</a></li>
            <li><a onClick={navigateToAbout}>About</a></li>
            <li><Link to="/sell" className="btn-outline">Sell Now</Link></li>
            <li><Link to="/buy" className="btn-primary">Buy Now</Link></li>
          </ul>
        </nav>
        <div className="user-section">
          {userData.userName && (
            <div className="user-profile">
              <span className="user-avatar">👤</span>
              <span className="welcome-text">Welcome, {userData.userName}</span>
            </div>
          )}
          <span className="logout-button" onClick={handleLogout}>Logout</span>
        </div>
      </header>

                  {/* Search and Filter Bar */}
                  <div className="search-sort-container">
                    <div className="search-bar">
                      <input
                        type="text"
                        placeholder="Car brand or name..."
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                      />
                      <button className="search-button">
                        <span role="img" aria-label="search">🔍</span>
                      </button>
                    </div>
                    <button 
                      className="filter-button" 
                      onClick={() => setShowFilterModal(true)}
                    >
                      Filter Options
                      {(filters.brands.length > 0 || filters.carTypes.length > 0 || filters.has3DModel !== null) && (
                        <span className="filter-badge"></span>
                      )}
                    </button>
                  </div>

                  {/* Filter Modal */}
                  {showFilterModal && (
                    <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
                      <div className="filter-modal" onClick={e => e.stopPropagation()}>
                        <div className="filter-modal-header">
                          <h3>Filter Options</h3>
                          <span className="close-modal" onClick={() => setShowFilterModal(false)}>&times;</span>
                        </div>
                        
                        <div className="filter-section">
                          <h4>Brands</h4>
                          <div className="filter-options">
                            {availableBrands.map(brand => (
                              <label key={brand} className="filter-option">
                                <input 
                                  type="checkbox" 
                                  checked={filters.brands.includes(brand)}
                                  onChange={() => toggleBrandFilter(brand)}
                                />
                                <span className="filter-label">{brand}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div className="filter-section">
                          <h4>Car Types</h4>
                          <div className="filter-options">
                            {availableCarTypes.map(carType => (
                              <label key={carType} className="filter-option">
                                <input 
                                  type="checkbox" 
                                  checked={filters.carTypes.includes(carType)}
                                  onChange={() => toggleCarTypeFilter(carType)}
                                />
                                <span className="filter-label">{carType}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        
                        <div className="filter-section">
                          <h4>3D Model</h4>
                          <div className="filter-options">
                            <label className="filter-option">
                              <input 
                                type="radio" 
                                name="3dFilter"
                                checked={filters.has3DModel === true}
                                onChange={() => toggle3DModelFilter(true)}
                              />
                              <span className="filter-label">With 3D Model</span>
                            </label>
                            <label className="filter-option">
                              <input 
                                type="radio" 
                                name="3dFilter"
                                checked={filters.has3DModel === false}
                                onChange={() => toggle3DModelFilter(false)}
                              />
                              <span className="filter-label">Without 3D Model</span>
                            </label>
                            <label className="filter-option">
                              <input 
                                type="radio" 
                                name="3dFilter"
                                checked={filters.has3DModel === null}
                                onChange={() => toggle3DModelFilter(null)}
                              />
                              <span className="filter-label">Show All</span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="filter-actions">
                          <button className="btn-outline" onClick={clearAllFilters}>Clear All</button>
                          <button className="btn-primary" onClick={() => setShowFilterModal(false)}>Apply Filters</button>
                        </div>
                      </div>
                    </div>
                  )}

              {/* Main content */}
              <main className="buynow-main">
                <section className="buynow-hero">
                  <h1>Buy Cars NOW</h1>
                  <p>Find your dream car today with our extensive collection of quality vehicles.</p>
                </section>

                <section className="buynow-cars-grid">
                  {loading ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Loading car listings...</p>
                    </div>
                  ) : error ? (
                    <div className="error-container">
                      <p className="error-message">{error}</p>
                      <button className="btn-primary" onClick={() => window.location.reload()}>
                        Retry
                      </button>
                    </div>
                  ) : getFilteredListings().length === 0 ? (
                    <div className="no-listings">
                      {searchTerm ? (
                        <>
                          <h3>No cars match your search</h3>
                          <p>Try different keywords or clear your search</p>
                          <button className="btn-primary" onClick={() => setSearchTerm('')}>Clear Search</button>
                        </>
                      ) : (
                        <>
                          <h3>No car listings available</h3>
                          <p>Be the first to sell your car!</p>
                          <Link to="/sell" className="btn-primary">Sell Your Car</Link>
                        </>
                      )}
                    </div>
                  ) : (
                    getFilteredListings().map((car) => (
                      <div className="car-item" key={car._id}>
                        <div 
                          className="car-image" 
                          onClick={() => openCarDetails(car)}
                          style={{ cursor: 'pointer' }}
                        >
                          {car.images && car.images.length > 0 ? (
                            <img src={`http://localhost:5000${car.images[0]}`} alt={car.brand} />
                          ) : (
                            <div className="placeholder-image"></div>
                          )}
                          {isOwner(car) && (
                            <div className="owner-badge">Your Listing</div>
                          )}
                          {car.model3d && (
                            <div className="model3d-badge">3D</div>
                          )}
                        </div>

                        <div className="car-details">
                          <h3>{car.brand.toUpperCase()} {car.carName || ''}</h3>
                          <p>{car.details.substring(0, 100)}...</p>
                          <div className="car-tags">
                            <span className="tag">{car.carType}</span>
                            <span className="tag">{car.brand}</span>
                            {car.carName && <span className="tag">{car.carName}</span>}
                            {car.model3d && (
                              <span className="tag feature-tag">3D Model</span>
                            )}
                          </div>

                          <div className="car-actions">
                            <button onClick={() => openCarDetails(car)} className="view-project">
                              View details <span className="arrow">→</span>
                            </button>

                            {/* Show Buy Now button only for non-owners */}
                            {!isOwner(car) && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  setSelectedCar(car);
                                  openPaymentModal();
                                }} 
                                className="buy-now-button"
                              >
                                Buy Now
                              </button>
                            )}
                          </div>

                          {/* Owner-only actions */}
                          {isOwner(car) && (
                            <div className="owner-actions">
                              <button 
                                className="edit-button" 
                                onClick={(e) => {
                                  handleEdit(car, e);
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="delete-button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(car, e);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </section>
              </main>


      {/* Footer - Matched to Homepage */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🚗</span>
              AutoVision
            </div>
            <p className="footer-description">
              Find your dream car at the best prices. Buy or sell with ease.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><a onClick={navigateToPopular}>Popular</a></li>
              <li><a onClick={navigateToContact}>Contact</a></li>
              <li><a onClick={navigateToAbout}>About</a></li>
              <li><Link to="/sell">Sell Now</Link></li>
              <li><Link to="/buy">Buy Now</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Info</h3>
            <address className="footer-contact-info">
              <p>123 Auto Avenue, Car City</p>
              <p>Email: auto.infovision@gmail.com</p>
              <p>Phone: (977) 9860340616 </p>
            </address>
          </div>
          
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon facebook-icon">f</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon twitter-icon">t</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon instagram-icon">i</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon linkedin-icon">in</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 AutoVision. All Rights Reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BuyNow;