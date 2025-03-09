import React from 'react';
import './HomePageStyles.css'; // CSS file for styling

const Homepage = () => {
  return (
    <div className="homepage-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <h1>AutoVision 3D</h1>
        </div>
        <nav className="navbar">
          <ul>
            <li><a href="/homepage">Home</a></li>
            <li><a href="/profile">Profile</a></li>
            <li><a href="/logout">Logout</a></li>
          </ul>
        </nav>
      </header>

      {/* Menu Bar */}
      <nav className="menu-bar">
        <ul>
          <li><a href="/about">About</a></li>
          <li><a href="/services">Services</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/help">Help</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <h2>Welcome to the Homepage!</h2>
        <p>You're successfully logged in. Enjoy exploring the features of AutoVision 3D.</p>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 AutoVision 3D. All rights reserved.</p>
        <div className="social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
