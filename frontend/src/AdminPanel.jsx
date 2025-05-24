import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeJSModelViewer from './ThreeJSModelViewer'; // Import the ThreeJSModelViewer component
import './AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [carListings, setCarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showModelViewer, setShowModelViewer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    brands: [],
    carTypes: [],
    has3DModel: null
  });
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableCarTypes, setAvailableCarTypes] = useState([]);
  const [violationData, setViolationData] = useState({
    reason: '',
    customMessage: ''
  });
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [successNotification, setSuccessNotification] = useState({
    show: false,
    carName: '',
    reason: ''
  });

  // Predefined violation options
  const violationOptions = [
    'Inappropriate content',
    'Misleading information',
    'Duplicate listing',
    'Suspected fraud',
    'Prohibited item',
    'Image violation',
    'Other'
  ];

  // All Brands and Car Types (copied from BuyNow.jsx)
  const allBrandsFromSellPage = [
    "Toyota", "Honda", "Ford", "BMW", "Audi", "Mercedes", "Hyundai", "Nissan", "Chevrolet", "Volkswagen",
    "Lexus", "Mazda", "Kia", "Jeep", "Subaru", "Tesla", "Volvo", "Porsche", "Land Rover", "Jaguar", "Acura", 
    "Infiniti", "Cadillac", "Buick", "Mini", "Other"
  ];

  const allCarTypesFromSellPage = [
    "Sedan", "SUV", "Sports", "Luxury", "Pickup Truck", "Hatchback", "Convertible", "Minivan", "Electric", 
    "Hybrid", "Compact", "Coupe", "Wagon", "Other"
  ];

  // Check admin authentication on component mount
  useEffect(() => {
    const isAdminAuth = localStorage.getItem('adminAuthenticated') === 'true';
    setAuthenticated(isAdminAuth);
    
    if (isAdminAuth) {
      fetchCarListings();
    } else {
      // Redirect to login page if not authenticated as admin
      navigate('/login');
    }

    // Set available brands and car types
    setAvailableBrands(allBrandsFromSellPage);
    setAvailableCarTypes(allCarTypesFromSellPage);
  }, [navigate]);

  // Function to fetch car listings
  const fetchCarListings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cars/car-listings');
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

  // Handle search input changes
  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter listings based on search and filters
  const getFilteredListings = () => {
    let filtered = [...carListings];

    // Apply search term
    if (searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(car =>
        car.brand.toLowerCase().includes(searchTermLower) ||
        (car.carName && car.carName.toLowerCase().includes(searchTermLower)) ||
        car.carType.toLowerCase().includes(searchTermLower)
      );
    }

    // Apply brand filtering
    if (filters.brands.length > 0) {
      filtered = filtered.filter(car => 
        filters.brands.some(selectedBrand => selectedBrand.toLowerCase() === car.brand.toLowerCase())
      );
    }

    // Apply carType filtering
    if (filters.carTypes.length > 0) {
      filtered = filtered.filter(car => 
        filters.carTypes.some(selectedType => selectedType.toLowerCase() === car.carType.toLowerCase())
      );
    }

    // 3D model filter
    if (filters.has3DModel !== null) {
      filtered = filtered.filter(car => (car.model3d != null) === filters.has3DModel);
    }

    // Always sort newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  };

  // Toggle brand filter
  const toggleBrandFilter = (brand) => {
    setFilters(prevFilters => {
      const brandIndex = prevFilters.brands.indexOf(brand);
      let updatedBrands;
      
      if (brandIndex === -1) {
        updatedBrands = [...prevFilters.brands, brand];
      } else {
        updatedBrands = prevFilters.brands.filter(b => b !== brand);
      }
      
      return {
        ...prevFilters,
        brands: updatedBrands
      };
    });
  };
  
  // Toggle car type filter
  const toggleCarTypeFilter = (carType) => {
    setFilters(prevFilters => {
      const typeIndex = prevFilters.carTypes.indexOf(carType);
      let updatedTypes;
      
      if (typeIndex === -1) {
        updatedTypes = [...prevFilters.carTypes, carType];
      } else {
        updatedTypes = prevFilters.carTypes.filter(t => t !== carType);
      }
      
      return {
        ...prevFilters,
        carTypes: updatedTypes
      };
    });
  };
  
  // Toggle 3D model filter
  const toggle3DModelFilter = (value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      has3DModel: prevFilters.has3DModel === value ? null : value
    }));
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      brands: [],
      carTypes: [],
      has3DModel: null
    });
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminToken');
    setAuthenticated(false);
    navigate('/login');
  };

  // Open car details
  const openCarDetails = (car) => {
    setSelectedCar(car);
    setActiveImageIndex(0);
    setShowModelViewer(false);
    setShowDetailsModal(true);
  };

  // Close car details modal
  const closeCarDetails = () => {
    setShowDetailsModal(false);
    setSelectedCar(null);
  };

  // Confirm delete with violation reason
  const confirmDelete = (car, e) => {
    if (e) e.stopPropagation();
    
    setCarToDelete(car);
    setViolationData({
      reason: '',
      customMessage: ''
    });
    
    // Close the details modal first
    setShowDetailsModal(false);
    
    // Show the delete confirmation after a brief delay
    setTimeout(() => {
      setShowDeleteConfirm(true);
    }, 100);
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCarToDelete(null);
    setViolationData({
      reason: '',
      customMessage: ''
    });
  };

  // Handle violation input changes
  const handleViolationChange = (e) => {
    const { name, value } = e.target;
    setViolationData({
      ...violationData,
      [name]: value
    });
  };

  const SuccessNotification = ({ notification, onClose }) => {
    if (!notification.show) return null;
  
    return (
      <div className="success-notification-container">
        <div className="success-notification">
          <div className="notification-icon success">✓</div>
          <div className="notification-content">
            <h4>Listing Removed Successfully</h4>
            <p>The listing for <strong>{notification.carName}</strong> has been removed.</p>
            <p>Violation reason: <span className="violation-reason">{notification.reason}</span></p>
          </div>
          <button className="close-notification" onClick={onClose}>×</button>
        </div>
      </div>
    );
  };

  // Send notification to user about listing removal
  const sendNotificationToUser = async (userId, carInfo, violationInfo) => {
    // Validate inputs
    if (!userId || userId === 'undefined' || userId.trim() === '') {
      console.error('Cannot send notification: Invalid user ID provided:', userId);
      return false;
    }
    
    if (!carInfo || !violationInfo) {
      console.error('Cannot send notification: Missing car info or violation info');
      return false;
    }
    
    try {
      console.log('📧 Preparing notification for user:', userId);
      console.log('📄 Car info:', {
        id: carInfo._id,
        brand: carInfo.brand,
        name: carInfo.carName,
        type: carInfo.carType
      });
      console.log('⚠️ Violation info:', violationInfo);
      
      // Create notification payload - simplified to match schema exactly
      const notificationPayload = {
        userId: userId.toString().trim(),
        type: 'violation', // Use 'violation' type directly
        title: 'Your Listing Has Been Removed',
        message: `Your listing for ${carInfo.brand} ${carInfo.carName || carInfo.carType} has been removed due to a violation: ${violationInfo.reason}`,
        details: violationInfo.customMessage || null, // Use details field properly
        carId: carInfo._id
      };
      
      console.log('📤 Sending notification request with payload:', {
        ...notificationPayload,
        message: notificationPayload.message.substring(0, 100) + '...'
      });
      
      const notificationResponse = await fetch('http://localhost:5000/api/notifications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Remove Authorization header since we made the route public
        },
        body: JSON.stringify(notificationPayload)
      });
      
      console.log('📨 Notification API response status:', notificationResponse.status);
      
      // Handle response
      let responseData;
      const responseContentType = notificationResponse.headers.get('content-type');
      
      try {
        if (responseContentType && responseContentType.includes('application/json')) {
          responseData = await notificationResponse.json();
        } else {
          const responseText = await notificationResponse.text();
          console.log('Non-JSON response received:', responseText.substring(0, 200));
          responseData = { error: 'Non-JSON response received from server' };
        }
      } catch (parseError) {
        console.error('Failed to parse notification response:', parseError);
        return false;
      }
      
      if (notificationResponse.ok && responseData.success) {
        console.log('✅ Notification sent successfully:', responseData);
        return true;
      } else {
        console.error('❌ Notification API error:', responseData);
        console.error('Response data:', responseData);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Failed to send notification - Network/Request error:', error);
      return false;
    }
  };

  // Handle delete with violation
  const handleDeleteWithViolation = async () => {
    if (!carToDelete) return;
    
    // Validate violation data
    if (!violationData.reason) {
      alert('Please select a violation reason.');
      return;
    }
    
    try {
      // Prevent double submission
      if (deleteInProgress) return;
      setDeleteInProgress(true);
      
      // Get admin authentication info
      const adminToken = localStorage.getItem('adminToken');
      
      // Verify we have an admin token
      if (!adminToken) {
        alert('Admin authentication token missing. Please log in again.');
        handleLogout();
        return;
      }
      
      console.log('Attempting to delete listing with ID:', carToDelete._id);
      
      // Store car data before deletion for notification and UI updates
      const carData = {...carToDelete};
      const violationInfo = { ...violationData };
      
      // Create headers for API requests
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        'x-admin-auth': 'true'
      };
      
      let deletionSuccessful = false;
      let errorMessage = '';
      
      // Try the admin-specific deletion endpoint first
      try {
        console.log('Trying admin deletion endpoint...');
        
        const adminDeleteResponse = await fetch('http://localhost:5000/api/admin/delete-listing', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            listingId: carToDelete._id,
            violationReason: violationData.reason,
            violationDetails: violationData.customMessage || 'No additional details provided.'
          })
        });
        
        console.log('Admin endpoint response status:', adminDeleteResponse.status);
        
        // Check if response is JSON or HTML
        const contentType = adminDeleteResponse.headers.get('content-type');
        console.log('Response content type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          const deleteResult = await adminDeleteResponse.json();
          console.log('Admin deletion response:', deleteResult);
          
          if (adminDeleteResponse.ok) {
            deletionSuccessful = true;
            console.log('Admin deletion successful');
          } else {
            errorMessage = deleteResult.message || deleteResult.error || 'Admin deletion failed';
            throw new Error(errorMessage);
          }
        } else {
          // Response is likely HTML (404 page), endpoint doesn't exist
          const responseText = await adminDeleteResponse.text();
          console.log('Admin endpoint returned HTML, likely 404:', responseText.substring(0, 200));
          throw new Error('Admin deletion endpoint not found');
        }
        
      } catch (adminError) {
        console.error('Admin deletion endpoint error:', adminError.message);
        
        // Try the standard car deletion endpoint as fallback
        try {
          console.log('Falling back to standard deletion endpoint...');
          
          const standardDeleteResponse = await fetch(
            `http://localhost:5000/api/cars/car-listings/${carToDelete._id}`, 
            {
              method: 'DELETE',
              headers: headers
            }
          );
          
          console.log('Standard endpoint response status:', standardDeleteResponse.status);
          
          // Handle different response types
          const responseContentType = standardDeleteResponse.headers.get('content-type');
          let deleteResult;
          
          try {
            if (responseContentType && responseContentType.includes('application/json')) {
              deleteResult = await standardDeleteResponse.json();
            } else {
              const responseText = await standardDeleteResponse.text();
              // If it's not JSON, create a mock response object
              deleteResult = { 
                message: responseText || 'No response message',
                success: standardDeleteResponse.ok 
              };
            }
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            deleteResult = { message: 'Failed to parse server response' };
          }
          
          console.log('Standard deletion response:', deleteResult);
          
          if (standardDeleteResponse.ok) {
            deletionSuccessful = true;
            console.log('Standard deletion successful');
          } else {
            errorMessage = deleteResult.message || deleteResult.error || `HTTP ${standardDeleteResponse.status}: ${standardDeleteResponse.statusText}`;
            throw new Error(errorMessage);
          }
          
        } catch (standardError) {
          console.error('Standard deletion endpoint error:', standardError.message);
          throw new Error(`Both deletion methods failed. Last error: ${standardError.message}`);
        }
      }
      
      // If we reach here, deletion was successful
      if (deletionSuccessful) {
        // Update local state to remove the deleted car
        setCarListings(prevListings => prevListings.filter(car => car._id !== carToDelete._id));
        
        // Clear deletion modal state
        setShowDeleteConfirm(false);
        setCarToDelete(null);
        setViolationData({
          reason: '',
          customMessage: ''
        });
        
        // Show success notification
        setSuccessNotification({
          show: true,
          carName: `${carData.brand} ${carData.carName || carData.carType}`,
          reason: violationInfo.reason
        });
        
        // Auto-hide success notification after 5 seconds
        setTimeout(() => {
          setSuccessNotification({
            show: false,
            carName: '',
            reason: ''
          });
        }, 5000);
        
        // Attempt to send notification to user (with retry logic)
        console.log('Attempting to send notification to user...');
        
        // Only try to send notification if we have a valid user ID
        if (carData.owner && carData.owner !== 'undefined' && carData.owner.trim() !== '') {
          let notificationSent = false;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (!notificationSent && retryCount < maxRetries) {
            try {
              console.log(`Notification attempt ${retryCount + 1}/${maxRetries}`);
              
              notificationSent = await sendNotificationToUser(carData.owner, carData, {
                reason: violationInfo.reason,
                customMessage: violationInfo.customMessage
              });
              
              if (notificationSent) {
                console.log('✅ Notification sent to user successfully');
                break;
              } else {
                console.warn(`❌ Notification sending failed, attempt ${retryCount + 1}/${maxRetries}`);
                retryCount++;
                
                // Wait before retry (exponential backoff)
                if (retryCount < maxRetries) {
                  const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
                  await new Promise(resolve => setTimeout(resolve, delay));
                }
              }
            } catch (notifError) {
              console.error(`Notification attempt ${retryCount + 1} failed:`, notifError.message);
              retryCount++;
              
              // Wait before retry
              if (retryCount < maxRetries) {
                const delay = Math.pow(2, retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
              }
            }
          }
          
          if (!notificationSent) {
            console.error('❌ Failed to send notification after all retry attempts');
            // Don't show error to admin - deletion was successful, notification is secondary
          }
        } else {
          console.warn('⚠️ Cannot send notification: Invalid or missing user ID');
        }
        
        console.log('✅ Listing deletion completed successfully');
      }
      
    } catch (error) {
      console.error('❌ Delete operation failed:', error.message);
      alert(`Failed to delete listing: ${error.message}`);
    } finally {
      setDeleteInProgress(false);
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

  return (
    <div className="admin-panel-container">
      {successNotification.show && (
      <SuccessNotification 
        notification={successNotification} 
        onClose={() => setSuccessNotification({ show: false, carName: '', reason: '' })} 
      />
    )}
      {/* Delete Confirmation Modal with Violation Selection */}
      {showDeleteConfirm && (
        <div className="modal-overlay delete-confirm-overlay">
          <div className="delete-modal violation-modal">
            <h3>Remove Listing</h3>
            <p>Please specify the violation reason for removing this listing.</p>
            
            <div className="form-group">
              <label htmlFor="violationReason">Violation Type:</label>
              <select
                id="violationReason"
                name="reason"
                value={violationData.reason}
                onChange={handleViolationChange}
                required
              >
                <option value="">Select a reason</option>
                {violationOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="customMessage">Additional Details (Optional):</label>
              <textarea
                id="customMessage"
                name="customMessage"
                value={violationData.customMessage}
                onChange={handleViolationChange}
                rows="4"
                placeholder="Provide more details about the violation"
              ></textarea>
            </div>
            
            <div className="delete-actions">
              <button className="btn-outline" onClick={cancelDelete}>Cancel</button>
              <button 
                className="btn-danger" 
                onClick={handleDeleteWithViolation}
                disabled={!violationData.reason || deleteInProgress}
              >
                {deleteInProgress ? 'Processing...' : 'Remove Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Car Details Modal */}
      {showDetailsModal && selectedCar && (
        <div className="modal-overlay" onClick={closeCarDetails}>
          <div className="car-details-modal" onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={closeCarDetails}>&times;</span>
            <h2>{selectedCar.brand.toUpperCase()} {selectedCar.carName || ''}</h2>
            
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
                {/* Replace iframe with ThreeJSModelViewer component */}
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
                  <span className="detail-label">Seller ID:</span>
                  <span className="detail-value">{selectedCar.owner}</span>
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

              <div className="detail-section">
                <h3>Listing Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{new Date(selectedCar.createdAt).toLocaleDateString()} {new Date(selectedCar.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">{new Date(selectedCar.updatedAt).toLocaleDateString()} {new Date(selectedCar.updatedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            {/* Admin action button */}
            <div className="car-details-actions">
              <button className="btn-danger" onClick={() => confirmDelete(selectedCar)}>
                Remove Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-logo">
          <span className="logo-icon">🚗</span>
          AutoVision Admin
        </div>
        <div className="admin-actions">
          <button onClick={handleLogout} className="btn-primary">Logout</button>
        </div>
      </header>

      {/* Admin Dashboard */}
      <div className="admin-dashboard">
        <div className="admin-sidebar">
          <div className="admin-nav">
            <div className="admin-nav-item active">
              Car Listings
            </div>
            <div className="admin-stats">
              <div className="stat-item">
                <span className="stat-label">Total Listings</span>
                <span className="stat-value">{carListings.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">With 3D Models</span>
                <span className="stat-value">{carListings.filter(car => car.model3d).length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-main-content">
          <div className="admin-page-title">
            <h1>Car Listings Management</h1>
          </div>

          {/* Search and Filter Bar */}
          <div className="search-sort-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by brand, name, or type..."
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

          {/* Car Listings Table */}
          <div className="admin-car-listings">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading car listings...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button className="btn-primary" onClick={fetchCarListings}>
                  Retry
                </button>
              </div>
            ) : getFilteredListings().length === 0 ? (
              <div className="no-listings">
                <h3>No matching listings found</h3>
                {searchTerm || filters.brands.length > 0 || filters.carTypes.length > 0 || filters.has3DModel !== null ? (
                  <button className="btn-primary" onClick={clearAllFilters}>Clear Filters</button>
                ) : null}
              </div>
            ) : (
              <div className="admin-listings-grid">
                {getFilteredListings().map((car) => (
                  <div className="admin-car-item" key={car._id}>
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
                      {car.model3d && (
                        <div className="model3d-badge">3D</div>
                      )}
                    </div>

                    <div className="car-details">
                      <h3>{car.brand.toUpperCase()} {car.carName || ''}</h3>
                      <div className="car-info">
                        <span className="car-type">{car.carType}</span>
                        <span className="car-owner">Owner: {car.ownerName || car.owner}</span>
                      </div>
                      <p className="car-description-preview">{car.details.substring(0, 100)}...</p>
                      <div className="car-date">
                        <span>Listed: {new Date(car.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="admin-car-actions">
                        <button onClick={() => openCarDetails(car)} className="view-details-btn">
                          View Details
                        </button>
                        <button 
                          className="remove-listing-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(car, e);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;