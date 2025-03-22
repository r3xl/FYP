import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SellPage.css';

const SellPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    topic: '',
    description: '',
    message: '',
    terms: false,
    images: []
  });
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    navigate('/login');
  };

  // Function to navigate to a specific section on the homepage
  const navigateToHomeSection = (sectionId) => {
    navigate('/');
    // Set a small timeout to ensure navigation completes before scrolling
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get user name from localStorage
  const userName = localStorage.getItem('name');
  
  // Handle input change
  const handleInputChange = (e) => {
    const { id, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value
    });
  };

  // Handle radio button change
  const handleRadioChange = (e) => {
    setFormData({
      ...formData,
      description: e.target.value
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      images: [...formData.images, ...files]
    });
  };

  // Remove uploaded image
  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Check required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.topic) newErrors.topic = 'Please select a topic';
    if (!formData.description) newErrors.description = 'Please select an option';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.terms) newErrors.terms = 'You must accept the terms';
    // Add validation for images
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    
    return newErrors;
  };

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      // Show errors and popup
      setErrors(formErrors);
      setShowPopup(true);
      
      // Hide popup after 5 seconds (increased from 3)
      setTimeout(() => {
        setShowPopup(false);
      }, 5000);
      
      return;
    }
    
    // Form submission logic would go here
    console.log('Form submitted', formData);
    alert('Form submitted successfully!');
  };

  return (
    <div className="sellpage-container">
      {/* Validation Popup */}
      {showPopup && (
        <div className="validation-popup">
          <div className="popup-content">
            <span className="close-popup" onClick={() => setShowPopup(false)}>&times;</span>
            <h3>Please fill in all required fields</h3>
            <ul>
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
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
            <li><Link to="/">Home</Link></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateToHomeSection('popular'); }}>Popular</a></li>
            <li><Link to="/sell">Sell</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact" className="btn-outline">Contact</Link></li>
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

      {/* Sell Form Section */}
      <section className="sell-form-section">
        <div className="sell-form-container">
          <h1>Sell Your Car</h1>
          <p className="form-subtitle">Find the best deal for your vehicle with our easy-to-use platform.</p>
          
          <form className="sell-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className={`form-input ${errors.phone ? 'input-error' : ''}`}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="topic">Choose a topic</label>
              <select 
                id="topic" 
                className={`form-select ${errors.topic ? 'input-error' : ''}`}
                value={formData.topic}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select one...</option>
                <option value="sell">Sell my car</option>
                <option value="trade">Trade-in</option>
                <option value="value">Car valuation</option>
                <option value="other">Other</option>
              </select>
              {errors.topic && <span className="error-message">{errors.topic}</span>}
            </div>
            
            <div className="form-group">
              <label>Which best describes you?</label>
              <div className={`radio-group ${errors.description ? 'input-error' : ''}`}>
                <div className="radio-column">
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="choice1" 
                      name="description" 
                      value="choice1" 
                      checked={formData.description === 'choice1'}
                      onChange={handleRadioChange}
                    />
                    <label htmlFor="choice1">First choice</label>
                  </div>
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="choice3" 
                      name="description" 
                      value="choice3" 
                      checked={formData.description === 'choice3'}
                      onChange={handleRadioChange}
                    />
                    <label htmlFor="choice3">Third choice</label>
                  </div>
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="choice5" 
                      name="description" 
                      value="choice5" 
                      checked={formData.description === 'choice5'}
                      onChange={handleRadioChange}
                    />
                    <label htmlFor="choice5">Fifth choice</label>
                  </div>
                </div>
                <div className="radio-column">
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="choice2" 
                      name="description" 
                      value="choice2" 
                      checked={formData.description === 'choice2'}
                      onChange={handleRadioChange}
                    />
                    <label htmlFor="choice2">Second choice</label>
                  </div>
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="choice4" 
                      name="description" 
                      value="choice4" 
                      checked={formData.description === 'choice4'}
                      onChange={handleRadioChange}
                    />
                    <label htmlFor="choice4">Fourth choice</label>
                  </div>
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="choice6" 
                      name="description" 
                      value="choice6" 
                      checked={formData.description === 'choice6'}
                      onChange={handleRadioChange}
                    />
                    <label htmlFor="choice6">Other</label>
                  </div>
                </div>
              </div>
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea 
                id="message" 
                className={`form-textarea ${errors.message ? 'input-error' : ''}`}
                placeholder="Please provide details about your car (make, model, year, condition, etc.)"
                value={formData.message}
                onChange={handleInputChange}
              ></textarea>
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>
            
            {/* Image Upload Section - Now Mandatory */}
            <div className="form-group">
            <label htmlFor="image-upload">Upload Images <span className="required-star">*</span></label>
            <div className={`image-upload-container ${errors.images ? 'input-error' : ''}`}>
                <input 
                type="file" 
                id="image-upload" 
                className="image-upload-input" 
                multiple 
                accept="image/*"
                onChange={handleImageUpload}
                />
                <label htmlFor="image-upload" className="image-upload-label">
                <span className="upload-icon">📷</span>
                <span>Choose files or drag and drop</span>
                <span className="upload-note">At least one image required</span>
                </label>
            </div>
            {errors.images && <span className="error-message">{errors.images}</span>}
            
            {/* Preview of uploaded images */}
            {formData.images.length > 0 && (
                <div className="image-preview-container">
                {formData.images.map((image, index) => (
                    <div key={index} className="image-preview-item">
                    <div className="image-preview">
                        <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} />
                    </div>
                    <span 
                        className="remove-image" 
                        onClick={() => removeImage(index)}
                    >
                        &times;
                    </span>
                    <span className="image-name">{image.name}</span>
                    </div>
                ))}
                </div>
            )}
            </div>
            
            <div className={`form-group terms-checkbox ${errors.terms ? 'input-error' : ''}`}>
              <input 
                type="checkbox" 
                id="terms" 
                checked={formData.terms}
                onChange={handleInputChange}
              />
              <label htmlFor="terms">I accept the Terms</label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>
            
            <div className="form-group submit-container">
              <button type="submit" className="btn-primary submit-btn">Submit</button>
            </div>
          </form>
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
              <li><Link to="/">Home</Link></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); navigateToHomeSection('popular'); }}>Popular</a></li>
              <li><Link to="/sell">Sell</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
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

export default SellPage;