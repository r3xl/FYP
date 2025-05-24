import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormStyles.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    // Debug: Log the values being sent
    console.log('Login attempt:', { email, password: password ? '[PROVIDED]' : '[EMPTY]' });
  
    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
  
    // Admin login check
    if (email === 'autovision@gmail.com' && password === 'autovision123') {
      const adminTokenPayload = {
        userId: 'admin-user-id',
        role: 'admin',
        name: 'Admin',
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      };
      
      const base64Encode = (obj) => {
        return btoa(JSON.stringify(obj)).replace(/=/g, '');
      };
      
      const adminToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Encode(adminTokenPayload)}.admin-signature`;
      
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('name', 'Admin');
      localStorage.setItem('userId', 'admin-user-id');
      
      setLoading(false);
      navigate('/admin');
      return;
    }
  
    try {
      console.log('Sending request to:', 'http://localhost:5000/api/auth/login');
      
      const response = await axios.post('http://localhost:5000/api/auth/login', { 
        email: email.trim(), 
        password 
      });
  
      console.log('Login response:', response);
  
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('name', response.data.name);
        localStorage.setItem('userId', response.data.userId);
  
        navigate('/homepage');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        // More specific error messages
        if (error.response.status === 400) {
          const message = error.response.data.message;
          if (message === 'Please provide all fields') {
            setError('Both email and password are required.');
          } else if (message === 'Invalid credentials') {
            setError('Invalid email or password. Please check your credentials.');
          } else {
            setError(message || 'Invalid login credentials.');
          }
        } else {
          setError(error.response.data.message || 'Error during login.');
        }
      } else if (error.request) {
        console.log('No response received:', error.request);
        setError('Unable to connect to the server. Please check if the server is running.');
      } else {
        console.log('Request setup error:', error.message);
        setError('Error setting up login request.');
      }
    } finally {
      setLoading(false);
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
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary form-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
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