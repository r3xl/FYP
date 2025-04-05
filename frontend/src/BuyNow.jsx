import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get user info from localStorage
  const userName = localStorage.getItem('name');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching car listings:', error);
        setError('Failed to load car listings. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCarListings();
  }, []);

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

  // Function to check if user is owner of a listing
  const isOwner = (listing) => {
    return listing.owner && userId && listing.owner === userId;
  };

  // Function to handle edit
  const handleEdit = (car) => {
    if (isOwner(car)) {
      navigate(`/edit-listing/${car._id}`);
    } else {
      alert('You can only edit your own listings');
    }
  };

  // Function to show delete confirmation
  const confirmDelete = (car) => {
    if (isOwner(car)) {
      setCarToDelete(car);
      setShowDeleteConfirm(true);
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
    if (!carToDelete || !token) return;
    
    if (!isOwner(carToDelete)) {
      alert('You can only delete your own listings');
      setShowDeleteConfirm(false);
      setCarToDelete(null);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/car-listings/${carToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
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
    setShowPaymentModal(true);
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
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
            <div className="delete-actions">
              <button className="btn-outline" onClick={cancelDelete}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
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
            <h2>{selectedCar.brand.toUpperCase()} {selectedCar.carType}</h2>
            
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
          </div>
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
            <li><Link to="/">Home</Link></li>
            <li><a href="#popular">Popular</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#about">About</a></li>
            <li><Link to="/sell" className="btn-outline">Sell Now</Link></li>
            <li><Link to="/buy" className="btn-primary">Buy Now</Link></li>
          </ul>
        </nav>
        <div className="user-section">
          {userName && (
            <div className="user-profile">
              <span className="user-avatar">👤</span>
              <span className="welcome-text">Welcome, {userName}</span>
            </div>
          )}
          <span className="logout-button" onClick={handleLogout}>Logout</span>
        </div>
      </header>

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
          ) : carListings.length === 0 ? (
            <div className="no-listings">
              <h3>No car listings available</h3>
              <p>Be the first to sell your car!</p>
              <Link to="/sell" className="btn-primary">Sell Your Car</Link>
            </div>
          ) : (
            carListings.map((car) => (
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
                  <h3>{car.brand.toUpperCase()} {car.carType}</h3>
                  <p>{car.details.substring(0, 100)}...</p>
                  <div className="car-tags">
                    <span className="tag">{car.carType}</span>
                    <span className="tag">{car.brand}</span>
                    {car.model3d && (
                      <span className="tag feature-tag">3D Model</span>
                    )}
                  </div>
                  <div className="car-actions">
                    <button onClick={() => openCarDetails(car)} className="view-project">
                      View details <span className="arrow">→</span>
                    </button>
                    
                    {!isOwner(car) && (
                      <button onClick={() => {
                        setSelectedCar(car);
                        openPaymentModal();
                      }} className="buy-now-button">
                        Buy Now
                      </button>
                    )}
                  </div>
                  
                  {/* Owner-only actions */}
                  {isOwner(car) && (
                    <div className="owner-actions">
                      <button className="edit-button" onClick={() => handleEdit(car)}>Edit</button>
                      <button className="delete-button" onClick={() => confirmDelete(car)}>Delete</button>
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
              <li><a href="#popular">Popular</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#about">About Us</a></li>
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