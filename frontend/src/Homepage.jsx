import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Homepage.css';
import NotificationPopup from './NotificationPopup'; // Import the NotificationPopup component

const Homepage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [popularCars, setPopularCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // Add state for userId
  
  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Slider images - replace these URLs with your actual image paths
  const sliderImages = [
    '/images/slider/slider1.jpg',
    '/images/slider/slider2.jpg',
    '/images/slider/slider3.jpg',
    '/images/slider/slider4.jpg',
    '/images/slider/slider5.jpg',
  ];
  
  // Auto-advance slider every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [sliderImages.length]);
  
  // Function to change slide
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  
  // Function to go to next slide
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderImages.length);
  };
  
  // Function to go to previous slide
  const prevSlide = () => {
    setCurrentSlide((prevSlide) => 
      prevSlide === 0 ? sliderImages.length - 1 : prevSlide - 1
    );
  };
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
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

  // Set user ID from localStorage and fetch car listings on component mount
  useEffect(() => {
    // Get user ID from localStorage and set it in state
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    
    const fetchPopularCars = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/car-listings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch car listings');
        }
        
        const data = await response.json();
        // Get up to 4 cars to display in the popular section
        setPopularCars(data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching car listings:', error);
        setLoading(false);
      }
    };
    
    fetchPopularCars();
  }, []);

  // Get user name from localStorage
  const userName = localStorage.getItem('name');

  // Function to open car details in Buy page
  const openCarDetails = (carId) => {
    navigate(`/buy`, { state: { selectedCarId: carId } });
  };

  return (
    <div className="homepage-container">
      {/* Include NotificationPopup component */}
      {userId && <NotificationPopup userId={userId} />}
      
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
            <li><Link to="/sell" className="btn-primary">Sell Now</Link></li>
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
          <span className="btn-primary" onClick={handleLogout}>Logout</span>
        </div>
      </header>

      {/* Hero Section with Image Slider */}
      <section className="hero-slider-section" id="home">
        <div className="slider-container">
          {sliderImages.map((img, index) => (
            <div 
              key={index} 
              className={`slider-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${img})` }}
            >
              <div className="slider-content">
                <h1>Welcome to AutoVision</h1>
                <p>Find your dream car at the best prices.</p>
                <div className="hero-buttons">
                  <button onClick={navigateToBuyNow} className="btn-primary">Buy Now</button>
                  <button onClick={navigateToSellNow} className="btn-primary">Sell Now</button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Slider controls */}
          <button className="slider-control prev" onClick={prevSlide}>❮</button>
          <button className="slider-control next" onClick={nextSlide}>❯</button>
          
          {/* Slider indicators */}
          <div className="slider-indicators">
            {sliderImages.map((_, index) => (
              <button 
                key={index} 
                className={`slider-indicator ${index === currentSlide ? 'active' : ''}`} 
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>
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
          <p>Browse our most popular vehicles available for purchase</p>
        </div>
        <div className="car-grid">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading popular cars...</p>
            </div>
          ) : popularCars.length === 0 ? (
            <div className="no-listings">
              <h3>No car listings available</h3>
              <p>Check back soon for new arrivals!</p>
            </div>
          ) : (
            popularCars.map((car) => (
              <div className="car-card" key={car._id} onClick={() => openCarDetails(car._id)}>
                <div className="car-image">
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
                  <h3>{car.brand.toUpperCase()} {car.carType}</h3>
                  <p>{car.details.substring(0, 80)}...</p>
                  <div className="car-tags">
                    <span className="tag">{car.carType}</span>
                    <span className="tag">{car.brand}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="view-all-container">
          <button onClick={navigateToBuyNow} className="btn-primary">View all</button>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section" id="about">
        <div className="about-content">
          <h2>About Us</h2>
          <p>AutoVision is your trusted platform for buying and selling quality vehicles. We connect car enthusiasts with their dream cars and help sellers find the right buyers.</p>
          <div className="about-buttons">
            <button onClick={navigateToBuyNow} className="btn-primary">Buy Now</button>
            <button onClick={navigateToSellNow} className="btn-primary">Sell Now</button>
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
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;