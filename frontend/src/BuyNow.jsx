import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './BuyNow.css';

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
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
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
    setShowDetailsModal(true);
  };

  // Function to close car details modal
  const closeCarDetails = () => {
    setShowDetailsModal(false);
    setSelectedCar(null);
  };

  // Function to check if user is owner of a listing
  const isOwner = (listing) => {
    return listing.owner === userId;
  };

  // Function to handle edit
  const handleEdit = (car) => {
    navigate(`/edit-listing/${car._id}`);
  };

  // Function to show delete confirmation
  const confirmDelete = (car) => {
    setCarToDelete(car);
    setShowDeleteConfirm(true);
  };
  
  // Function to cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCarToDelete(null);
  };

  // Function to handle delete
  const handleDelete = async () => {
    if (!carToDelete || !token) return;
    
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
    } catch (error) {
      console.error('Error deleting car listing:', error);
      alert('Failed to delete car listing. Please try again.');
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
      
      {/* Car Details Modal */}
      {showDetailsModal && selectedCar && (
        <div className="modal-overlay" onClick={closeCarDetails}>
          <div className="car-details-modal" onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={closeCarDetails}>&times;</span>
            <h2>{selectedCar.brand.toUpperCase()} {selectedCar.carType}</h2>
            
            {/* Image carousel */}
            <div className="car-details-images">
              {selectedCar.images.length > 0 ? (
                selectedCar.images.map((image, index) => (
                  <div key={index} className="car-detail-image">
                    <img src={`http://localhost:5000${image}`} alt={`${selectedCar.brand} ${index + 1}`} />
                  </div>
                ))
              ) : (
                <div className="car-detail-image no-image">
                  <span>No images available</span>
                </div>
              )}
            </div>
            
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
            
            {/* Action buttons - only for owner */}
            {isOwner(selectedCar) && (
              <div className="car-details-actions">
                <button className="btn-primary" onClick={() => handleEdit(selectedCar)}>Edit Listing</button>
                <button className="btn-danger" onClick={() => confirmDelete(selectedCar)}>Delete Listing</button>
              </div>
            )}
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
                <div className="car-image">
                  {car.images && car.images.length > 0 ? (
                    <img src={`http://localhost:5000${car.images[0]}`} alt={car.brand} />
                  ) : (
                    <div className="placeholder-image"></div>
                  )}
                  {isOwner(car) && (
                    <div className="owner-badge">Your Listing</div>
                  )}
                </div>
                <div className="car-details">
                  <h3>{car.brand.toUpperCase()} {car.carType}</h3>
                  <p>{car.details.substring(0, 100)}...</p>
                  <div className="car-tags">
                    <span className="tag">{car.carType}</span>
                    <span className="tag">{car.brand}</span>
                    <span className="tag">Used</span>
                  </div>
                  <button onClick={() => openCarDetails(car)} className="view-project">
                    View details <span className="arrow">→</span>
                  </button>
                  
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