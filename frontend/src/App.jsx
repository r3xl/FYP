import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import Homepage from './Homepage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegistrationForm />} />
                    <Route path="/homepage" element={<Homepage />} />
                    <Route path="/" element={<Navigate to="/register" />} />  {/* Redirect to registration */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
