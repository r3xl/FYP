import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormStyles.css';

const RegistrationForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for empty fields
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });

      if (response.status === 201) {
        setSuccess(true);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/login'); // Redirect to login after successful signup with a small delay
        }, 1500);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Error during registration.');
      } else {
        setError('Error connecting to the server.');
      }
    }
  };

  return (
    <div className="homepage-container auth-container">
      {/* Header */}
      <header className="header auth-header">
        <div className="logo">
          <span className="logo-icon">🚗</span>
          <h1>AutoVision</h1>
        </div>
        <nav className="navbar">
          <ul className="nav-links">
            <li><span className="btn-outline" onClick={() => navigate('/login')}>Login</span></li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="form-container">
          <h2 className="form-title">Create Your Account</h2>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">Registration successful! Redirecting to login...</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="form-input"
              />
            </div>
            <button type="submit" className="btn-primary form-button">Sign Up</button>
          </form>
          
          <p className="redirect-text">
            Already have an account? <span className="link" onClick={() => navigate('/login')}>Login</span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2025 AutoVision. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegistrationForm;