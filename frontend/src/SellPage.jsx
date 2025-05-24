import React, { useState, useEffect } from 'react';
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
    carName: '',
    description: '', 
    message: '',
    terms: false,
    images: [],
    model3d: null
  });
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

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
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
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

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      images: [...formData.images, ...files]
    });
  };

  // Handle 3D model upload
  const handle3DModelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        model3d: file
      });
    }
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

  // Remove 3D model
  const remove3DModel = () => {
    setFormData({
      ...formData,
      model3d: null
    });
  };
  
// Validate form
const validateForm = () => {
  const newErrors = {};
  
  // Check required fields
  if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
  if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
  if (!formData.email.trim()) newErrors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
  if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
  if (!formData.topic) newErrors.topic = 'Please select a car type';
  if (!formData.description) newErrors.description = 'Please select a car brand';
  if (!formData.carName.trim()) newErrors.carName = 'Car name is required';
  if (!formData.message.trim()) newErrors.message = 'Vehicle details are required';
  if (!formData.terms) newErrors.terms = 'You must accept the terms';
  
  // Make images mandatory instead of 3D model
  if (formData.images.length === 0) newErrors.images = 'At least one image is required';
  
  return newErrors;
};

  // Open Terms Modal
  const openTermsModal = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  // Close Terms Modal
  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  // Accept terms
  const acceptTerms = () => {
    setFormData({
      ...formData,
      terms: true
    });
    setShowTermsModal(false);
  };

  // View listings button handler
  const viewListings = () => {
    setShowSuccess(false);
    navigate('/buy');
  };

  // Create new listing button handler
  const createNewListing = () => {
    setShowSuccess(false);
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      topic: '',
      description: '',
      carName: '',
      message: '',
      terms: false,
      images: [],
      model3d: null
    });
    setApiError(null);
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      // Show errors and popup
      setErrors(formErrors);
      setShowPopup(true);
      
      // Hide popup after 5 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 5000);
      
      return;
    }
    
    // Reset any previous API errors
    setApiError(null);
    
    // Set loading state
    setIsSubmitting(true);
    
    // Create FormData object for file uploads
    const submissionData = new FormData();
    submissionData.append('firstName', formData.firstName);
    submissionData.append('lastName', formData.lastName);
    submissionData.append('email', formData.email);
    submissionData.append('phone', formData.phone);
    submissionData.append('topic', formData.topic);
    submissionData.append('carName', formData.carName);
    submissionData.append('description', formData.description);
    submissionData.append('message', formData.message);
    
    // Add images
    formData.images.forEach((image) => {
      submissionData.append('images', image);
    });
    
    // Add 3D model if exists
    if (formData.model3d) {
      submissionData.append('model3d', formData.model3d);
    }
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      setApiError('You must be logged in to submit a listing');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // API endpoint - make sure this matches your backend
      const endpoint = 'http://localhost:5000/api/cars/car-listings';
      
      console.log(`Submitting to: ${endpoint}`);
      console.log('Token:', token);
      
      // Send data to backend
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submissionData
      });
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log('Submission successful:', data);
      
      // Show success modal
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setApiError(`Error: ${error.message}`);
    } finally {
      // Reset loading state
      setIsSubmitting(false);
    }
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
      
      {/* API Error Message */}
      {apiError && (
        <div className="validation-popup">
          <div className="popup-content error-popup">
            <span className="close-popup" onClick={() => setApiError(null)}>&times;</span>
            <h3>Submission Error</h3>
            <p>{apiError}</p>
            <p className="error-help">Please check your network connection and try again. If the problem persists, contact support.</p>
          </div>
        </div>
      )}
      
      {/* Success Popup */}
      {showSuccess && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-icon">✓</div>
            <h2>Listing Submitted Successfully!</h2>
            <p>Your car listing has been added to our database and is now visible to potential buyers.</p>
            <div className="success-actions">
              <button className="btn-primary" onClick={viewListings}>View Listings</button>
              <button className="btn-outline" onClick={createNewListing}>Create New Listing</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="terms-modal-overlay">
          <div className="terms-modal">
            <span className="close-modal" onClick={closeTermsModal}>&times;</span>
            <h2>Terms of Service</h2>
            <div className="terms-content">
              <h3>1. Acceptance of Terms</h3>
              <p>By accessing and using the AutoVision service ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.</p>
              
              <h3>2. Description of Service</h3>
              <p>AutoVision provides an online platform for users to list, browse, and purchase vehicles. The Service includes all aspects of the AutoVision website and related applications.</p>
              
              <h3>3. User Accounts</h3>
              <p>To use certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
              
              <h3>4. Listing Requirements</h3>
              <p>When listing a vehicle, you agree to provide accurate, complete, and up-to-date information about the vehicle. You may not list vehicles that you do not own or are not authorized to sell.</p>
              
              <h3>5. Prohibited Content</h3>
              <p>You may not post content that is illegal, fraudulent, deceptive, misleading, or that infringes on the rights of others.</p>
              
              <h3>6. Fees and Payments</h3>
              <p>AutoVision may charge fees for certain features of the Service. All fees are non-refundable unless otherwise specified.</p>
              
              <h3>7. Privacy Policy</h3>
              <p>Your use of the Service is subject to our Privacy Policy, which is incorporated into these Terms by reference.</p>
              
              <h3>8. Limitation of Liability</h3>
              <p>AutoVision shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.</p>
              
              <h3>9. Termination</h3>
              <p>AutoVision may terminate or suspend your access to the Service at any time, without notice, for any reason.</p>
              
              <h3>10. Changes to Terms</h3>
              <p>AutoVision reserves the right to modify these Terms at any time. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.</p>
              
              <h3>11. Governing Law</h3>
              <p>These Terms shall be governed by the laws of the jurisdiction in which AutoVision is established, without regard to its conflict of law provisions.</p>
            </div>
            <div className="terms-actions">
              <button className="btn-primary" onClick={acceptTerms}>Accept</button>
              <button className="btn-outline" onClick={closeTermsModal}>Decline</button>
            </div>
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
            <li><Link to="/homepage">Home</Link></li>
            <li><a onClick={navigateToPopular}>Popular</a></li>
            <li><a onClick={navigateToContact}>Contact</a></li>
            <li><a onClick={navigateToAbout}>About</a></li>
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
              <label htmlFor="topic">Car Type</label>
              <select 
                id="topic" 
                className={`form-select ${errors.topic ? 'input-error' : ''}`}
                value={formData.topic}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select one...</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="sports">Sports Car</option>
                <option value="luxury">Luxury</option>
                <option value="pickup">Pickup Truck</option>
                <option value="hatchback">Hatchback</option>
                <option value="convertible">Convertible</option>
                <option value="minivan">Minivan</option>
                <option value="electric">Electric Vehicle</option>
                <option value="hybrid">Hybrid</option>
                <option value="compact">Compact</option>
                <option value="coupe">Coupe</option>
                <option value="wagon">Wagon</option>
                <option value="other">Other</option>
              </select>
              {errors.topic && <span className="error-message">{errors.topic}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Car Brand</label>
              <select 
                id="description" 
                className={`form-select ${errors.description ? 'input-error' : ''}`}
                value={formData.description}
                onChange={handleInputChange}
              >
                <option value="" disabled>Select a brand...</option>
                <option value="toyota">Toyota</option>
                <option value="honda">Honda</option>
                <option value="ford">Ford</option>
                <option value="bmw">BMW</option>
                <option value="audi">Audi</option>
                <option value="mercedes">Mercedes-Benz</option>
                <option value="hyundai">Hyundai</option>
                <option value="nissan">Nissan</option>
                <option value="chevrolet">Chevrolet</option>
                <option value="volkswagen">Volkswagen</option>
                <option value="lexus">Lexus</option>
                <option value="mazda">Mazda</option>
                <option value="kia">Kia</option>
                <option value="jeep">Jeep</option>
                <option value="subaru">Subaru</option>
                <option value="tesla">Tesla</option>
                <option value="volvo">Volvo</option>
                <option value="porsche">Porsche</option>
                <option value="land_rover">Land Rover</option>
                <option value="jaguar">Jaguar</option>
                <option value="acura">Acura</option>
                <option value="infiniti">Infiniti</option>
                <option value="cadillac">Cadillac</option>
                <option value="buick">Buick</option>
                <option value="mini">Mini</option>
                <option value="other_brand">Other</option>
              </select>
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="carName">Car Name</label>
              <input 
                type="text" 
                id="carName" 
                className={`form-input ${errors.carName ? 'input-error' : ''}`}
                placeholder="Enter car model name (e.g., Civic, Corolla, F-150)"
                value={formData.carName}
                onChange={handleInputChange}
              />
              {errors.carName && <span className="error-message">{errors.carName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Vehicle Details</label>
              <textarea 
                id="message" 
                className={`form-textarea ${errors.message ? 'input-error' : ''}`}
                placeholder="Please provide details about your car (model, year, mileage, condition, features, history, etc.)"
                value={formData.message}
                onChange={handleInputChange}
              ></textarea>
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>
            
            {/* Image Upload Section - Required */}
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
            
            {/* 3D Model Upload Section - Optional */}
            <div className="form-group">
              <label htmlFor="model-upload">Upload 3D Model (Optional)</label>
              <div className="model-upload-container">
                <input 
                  type="file" 
                  id="model-upload" 
                  className="model-upload-input" 
                  accept=".obj,.glb,.gltf,.stl,.fbx"
                  onChange={handle3DModelUpload}
                />
                <label htmlFor="model-upload" className="model-upload-label">
                  <span className="upload-icon">🚘</span>
                  <span>Choose 3D model file</span>
                  <span className="upload-note">Supported formats: OBJ, GLB, GLTF, STL, FBX</span>
                </label>
              </div>
              
              {/* Preview of uploaded 3D model */}
              {formData.model3d && (
                <div className="model-preview-container">
                  <div className="model-preview-item">
                    <div className="model-preview">
                      <span className="model-icon">🏁</span>
                    </div>
                    <span 
                      className="remove-model" 
                      onClick={remove3DModel}
                    >
                      &times;
                    </span>
                    <span className="model-name">{formData.model3d.name}</span>
                  </div>
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
              <label htmlFor="terms">
                I accept the <a href="#" onClick={openTermsModal}>Terms of Service</a>
              </label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>
            
            <div className="form-group submit-container">
              <button 
                type="submit" 
                className={`btn-primary submit-btn ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Listing'
                )}
              </button>
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
               <li><a onClick={navigateToPopular}>Popular</a></li>
               <li><a onClick={navigateToContact}>Contact</a></li>
               <li><a onClick={navigateToAbout}>About</a></li>
              <li><Link to="/sell">Sell</Link></li>
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