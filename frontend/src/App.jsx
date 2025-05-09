import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import Homepage from './Homepage';
import BuyNow from './BuyNow';
import SellPage from './SellPage';
import AdminPanel from './AdminPanel';

function App() {
    return (
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegistrationForm />} />
                    <Route path="/homepage" element={<Homepage />} />
                    <Route path="/buy" element={<BuyNow />} />
                    <Route path="/sell" element={<SellPage />} />
                    <Route path="/" element={<Navigate to="/register" />} />  {/* Redirect to registration */}
                    <Route path="/admin" element={<AdminPanel />} />
                </Routes>
            </Router>
    );
}

export default App;