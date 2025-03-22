import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './BuyNow.css';

const BuyNow = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  // Get user name from localStorage
  const userName = localStorage.getItem('name');

  return (
    <div className="buynow-container">
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
          {/* Car items - using a cleaner approach with mapped data */}
          {Array(12).fill().map((_, index) => (
            <div className="car-item" key={index}>
              <div className="car-image">
                <div className="placeholder-image"></div>
              </div>
              <div className="car-details">
                <h3>Car Model {index + 1}</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.</p>
                <div className="car-tags">
                  <span className="tag">Tag one</span>
                  <span className="tag">Tag two</span>
                  <span className="tag">Tag three</span>
                </div>
                <Link to="/project" className="view-project">View details <span className="arrow">→</span></Link>
              </div>
            </div>
          ))}
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