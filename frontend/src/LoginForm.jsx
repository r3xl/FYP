import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormStyles.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });

      if (response.status === 200) {
        // Save JWT Token and User Name
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('name', response.data.name); // Save user's name

        navigate('/homepage'); // Redirect to homepage after successful login
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Error during login.');
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
            <li><span className="btn-outline" onClick={() => navigate('/register')}>Sign Up</span></li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="form-container">
          <h2 className="form-title">Welcome Back</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                className="form-input"
              />
            </div>
            <button type="submit" className="btn-primary form-button">Login</button>
          </form>
          <p className="redirect-text">
            Don't have an account? {' '}
            <span className="link" onClick={() => navigate('/register')}>Sign Up</span>
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

export default LoginForm;