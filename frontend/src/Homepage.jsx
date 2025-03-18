import React from 'react';
import './HomePageStyles.css';

const Homepage = () => {
  return (
    <div className="homepage-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <h1>Logo</h1>
        </div>
        <nav className="nav-links">
          <a href="/homepage" className="active">Home</a>
          <a href="/services">Services</a>
          <a href="/sell">Sell</a>
          <a href="/about">About</a>
          <a href="/contact" className="contact-link">Contact</a>
          <a href="/buy-now" className="buy-now-link">Buy Now</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Welcome to AutoVision</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            varius enim in eros elementum tristique. Duis cursus, mi quis viverra
            ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.
          </p>
          <div className="hero-buttons">
            <a href="/buy-now" className="buy-now-btn">Buy Now</a>
            <a href="/contact" className="contact-btn">Contact</a>
          </div>
        </div>
        <div className="hero-image">
          {/* Image placeholder */}
        </div>
      </section>

      {/* Our Services Section */}
      <section className="services-section">
        <h2>Our Services</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
        </p>
        <div className="services-container">
          <div className="service-item">
            <i className="fas fa-cube"></i>
            <h3>Highlight value one</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="service-item">
            <i className="fas fa-cube"></i>
            <h3>Highlight value two</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="service-item">
            <i className="fas fa-cube"></i>
            <h3>Highlight value three</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
      </section>

      {/* Popular Cars Section */}
      <section className="popular-cars-section">
        <h2>Popular Cars</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <div className="cars-container">
          <div className="car-item">
            <div className="car-image"></div>
            <h3>Car 1</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="car-item">
            <div className="car-image"></div>
            <h3>Car 2</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="car-item">
            <div className="car-image"></div>
            <h3>Car 3</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="car-item">
            <div className="car-image"></div>
            <h3>Car 4</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
        <button className="view-all-btn">View all</button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 AutoVision 3D. All rights reserved.</p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
