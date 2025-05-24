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
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  
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

  // Handle contact form input changes
  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle contact form submission
  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
  
    // Validate form data before sending
    if (!contactForm.name || !contactForm.email || !contactForm.phone || !contactForm.subject || !contactForm.message) {
      setSubmitMessage('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }
  
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      setSubmitMessage('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }
  
    try {
      console.log('Sending contact form data:', contactForm);
      
      const response = await fetch('http://localhost:5000/api/contact/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          subject: contactForm.subject,
          message: contactForm.message
        }),
      });
  
      const data = await response.json();
      console.log('Response from server:', data);
  
      if (response.ok && data.success) {
        setSubmitMessage('Message sent successfully! We will get back to you soon.');
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitMessage(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitMessage('Failed to send message. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        // Updated API endpoint to match the server route structure
        const response = await fetch('http://localhost:5000/api/cars/car-listings');
        
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
          {/* <span className="logo-icon"> <img src = "/images/icons/autovision.png"></img></span> */}
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
        <div className="service-highlights">
          <div className="service-card">
            <div className="service-icon">
              <img src="/images/icons/icon1.png" alt="Chat with Sellers" className="service-img" />
            </div>
            <h3>Chat with Sellers.</h3>
            <p>Directly communicate with sellers in real time.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <img src="/images/icons/icon2.png" alt="Easy Selling" className="service-img" />
            </div>
            <h3>Easy Selling</h3>
            <p>Sell your car effortlessly with our platform.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <img src="/images/icons/icon3.png" alt="Easy Filter Options" className="service-img" />
            </div>
            <h3>Easy Filter Options</h3>
            <p>Search by model, name, brand.</p>
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

      {/* About Us Section - Enhanced */}
<section className="about-section" id="about">
  <div className="about-container">
    <div className="about-content">
      <h2 className="about-title">ABOUT US</h2>
      <div className="about-underline"></div>
      <p className="about-tagline">Driving dreams forward since 2024</p>
      <p className="about-description">
        AutoVision is your trusted platform for buying and selling quality vehicles. 
        We connect car enthusiasts with their dream cars and help sellers find the 
        right buyers. Our dedicated team ensures a seamless experience from start 
        to finish, with a focus on transparency, convenience, and customer satisfaction.
      </p>
      <div className="about-stats">
        <div className="stat-item">
          <div className="stat-number">3.7K+</div>
          <div className="stat-label">Happy Customers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">1.5K+</div>
          <div className="stat-label">Cars Sold</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">4.5</div>
          <div className="stat-label">Rating</div>
        </div>
      </div>
      <div className="about-buttons">
        <button onClick={navigateToBuyNow} className="btn-primary">Buy Now</button>
        <button onClick={navigateToSellNow} className="btn-primary">Sell Now</button>
      </div>
    </div>
    <div className="about-image-container">
      <div className="about-team-illustration">
        <div className="about-blob"></div>
        <div className="about-blob-secondary"></div>
        <img src="/images/about/about1.png" alt="AutoVision Team" className="team-image" />
        <div className="about-floating-element element-1">🚗</div>
        <div className="about-floating-element element-2">💬</div>
        <div className="about-floating-element element-3">⭐</div>
      </div>
    </div>
  </div>
</section>

      {/* Enhanced Contact Section */}
<section className="contact-section" id="contact">
  <div className="section-header">
    <h2>Get In Touch</h2>
    <p>Have questions about our services? Reach out to our team today.</p>
  </div>
  
  <div className="enhanced-contact-container">
    <div className="contact-info-card">
      <div className="contact-header">
        <h3>Contact Information</h3>
        <p>Fill out the form and our team will get back to you within 24 hours</p>
      </div>
      
      <div className="contact-details">
        <div className="contact-item">
          <div className="contact-icon">
            <i className="phone-icon">📞</i>
          </div>
          <div className="contact-text">
            <p>+1 (977) 9860340616</p>
          </div>
        </div>
        
        <div className="contact-item">
          <div className="contact-icon">
            <i className="email-icon">✉️</i>
          </div>
          <div className="contact-text">
            <p>auto.infovision@gmail.com</p>
          </div>
        </div>
        
        <div className="contact-item">
          <div className="contact-icon">
            <i className="location-icon">📍</i>
          </div>
          <div className="contact-text">
            <p>123 Auto Avenue, Car City</p>
          </div>
        </div>
      </div>
      
      <div className="contact-social">
        <h4>Connect With Us</h4>
        <div className="social-icons">
          <a href="https://facebook.com" className="social-icon"><i className="facebook-icon">f</i></a>
          <a href="https://x.com" className="social-icon"><i className="twitter-icon">t</i></a>
          <a href="https://instagram.com" className="social-icon"><i className="instagram-icon">ig</i></a>
          <a href="https://linkedin.com" className="social-icon"><i className="linkedin-icon">in</i></a>
        </div>
      </div>
    </div>
    
    <div className="contact-form-wrapper">
      <form className="enhanced-contact-form" onSubmit={handleContactFormSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name"
              className="form-input-enhanced" 
              placeholder="John Doe" 
              value={contactForm.name}
              onChange={handleContactFormChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              className="form-input-enhanced" 
              placeholder="john@example.com" 
              value={contactForm.email}
              onChange={handleContactFormChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone"
              className="form-input-enhanced" 
              placeholder="(977) 9812345678" 
              value={contactForm.phone}
              onChange={handleContactFormChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <select 
              id="subject" 
              name="subject"
              className="form-input-enhanced"
              value={contactForm.subject}
              onChange={handleContactFormChange}
              required
            >
              <option value="" disabled>Select a subject</option>
              <option value="service">Car Service</option>
              <option value="sales">Car Sales</option>
              <option value="support">Customer Support</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Your Message</label>
          <textarea 
            id="message" 
            name="message"
            className="form-textarea-enhanced" 
            placeholder="How can we help you today?"
            value={contactForm.message}
            onChange={handleContactFormChange}
            required
          ></textarea>
        </div>
        
        {submitMessage && (
          <div className={`submit-message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>
            {submitMessage}
          </div>
        )}
        
        <button type="submit" className="btn-contact-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
          <span className="submit-icon">→</span>
        </button>
      </form>
    </div>
  </div>
  
  <div className="contact-decoration">
    <div className="decoration-circle"></div>
    <div className="decoration-dots"></div>
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