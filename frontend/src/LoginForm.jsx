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
  
    // Admin login check
    if (email === 'autovision@gmail.com' && password === 'autovision123') {
      // Generate a proper admin JWT token
      const adminTokenPayload = {
        userId: 'admin-user-id', // You could use a real admin ID or this placeholder
        role: 'admin',
        name: 'Admin',
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
      };
      
      // Simple base64 encoding (not secure for production, just for demo)
      const base64Encode = (obj) => {
        return btoa(JSON.stringify(obj)).replace(/=/g, '');
      };
      
      // Create a simple JWT-like token (header.payload.signature)
      const adminToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Encode(adminTokenPayload)}.admin-signature`;
      
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('name', 'Admin');
      localStorage.setItem('userId', 'admin-user-id');
      
      navigate('/admin');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
  
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('name', response.data.name);
        localStorage.setItem('userId', response.data.userId);
  
        navigate('/homepage');
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