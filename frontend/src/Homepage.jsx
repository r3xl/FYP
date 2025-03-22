import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    navigate('/login');
  };

  // Function to navigate to Buy Now page
  const navigateToBuyNow = () => {
    navigate('/buy');
  };

  // Function to navigate to Sell Now page
  const navigateToSellNow = () => {
    navigate('/sell');
  };

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get user name from localStorage
  const userName = localStorage.getItem('name');

  return (
    <div className="homepage-container">
      {/* Navigation */}
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
            <li><a href="#home">Home</a></li>
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

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <h1>Welcome to AutoVision</h1>
          <p>Find your dream car at the best prices. Browse through our extensive collection and buy or sell with ease.</p>
          <div className="hero-buttons">
            <button onClick={navigateToBuyNow} className="btn-primary">Buy Now</button>
            <button onClick={navigateToSellNow} className="btn-outline">Sell Now</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="placeholder-image"></div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="services">
        <div className="section-header">
          <h2>Our Services</h2>
          <p>We offer the best car buying and selling experience with full transparency and ease.</p>
        </div>
        <div className="service-highlights">
          <div className="service-card">
            <div className="service-icon"><div className="icon-placeholder"></div></div>
            <h3>Easy Selling</h3>
            <p>Sell your car effortlessly with our platform.</p>
          </div>
          <div className="service-card">
            <div className="service-icon"><div className="icon-placeholder"></div></div>
            <h3>Verified Listings</h3>
            <p>All cars go through verification for quality assurance.</p>
          </div>
          <div className="service-card">
            <div className="service-icon"><div className="icon-placeholder"></div></div>
            <h3>Best Prices</h3>
            <p>We ensure competitive pricing on all listings.</p>
          </div>
        </div>
      </section>

      {/* Popular Cars Section */}
      <section className="popular-cars-section" id="popular">
        <div className="section-header">
          <h2>Popular Cars</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div className="car-grid">
          <div className="car-card">
            <div className="car-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="car-details">
              <h3>Car 1</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.</p>
            </div>
          </div>
          <div className="car-card">
            <div className="car-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="car-details">
              <h3>Car 2</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.</p>
            </div>
          </div>
          <div className="car-card">
            <div className="car-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="car-details">
              <h3>Car 3</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.</p>
            </div>
          </div>
          <div className="car-card">
            <div className="car-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="car-details">
              <h3>Car 4</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.</p>
            </div>
          </div>
        </div>
        <div className="view-all-container">
          <button onClick={navigateToBuyNow} className="btn-outline">View all</button>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section" id="about">
        <div className="about-content">
          <h2>About Us</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
          <div className="about-buttons">
            <button onClick={navigateToBuyNow} className="btn-primary">Buy Now</button>
            <button onClick={navigateToSellNow} className="btn-outline">Sell Now</button>
          </div>
        </div>
        <div className="about-image">
          <div className="placeholder-image"></div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="section-header">
          <h2>Contact Now</h2>
        </div>
        <div className="contact-container">
          <form className="contact-form">
            <input type="text" placeholder="Name" className="form-input" />
            <input type="email" placeholder="E-mail" className="form-input" />
            <textarea placeholder="Message" className="form-textarea"></textarea>
            <button type="submit" className="btn-primary">Send</button>
          </form>
          <div className="contact-image">
            <div className="placeholder-image"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
              <li><a href="#home">Home</a></li>
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
              <p>Phone: (977) 9860340616</p>
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
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;