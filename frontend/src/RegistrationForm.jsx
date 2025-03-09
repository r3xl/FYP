import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import './FormStyles.css';

const RegistrationForm = () => {
  const [name, setName] = useState(''); // State for name
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
        navigate('/login'); // Redirect to login after successful signup
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
    <div className="form-container">
      <h2 className="form-title">Signup</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Registration successful!</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
        />
        <button type="submit">Signup</button>
      </form>
      <p className="redirect-text">
        Already have an account? <span className="link" onClick={() => navigate('/login')}>Login</span>
      </p>
    </div>
  );
};

export default RegistrationForm;
