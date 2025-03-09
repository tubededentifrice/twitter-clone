import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AuthService from './services/auth.service';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className="container-fluid">
        <Navbar currentUser={currentUser} logout={logout} />
        <Routes>
          <Route path="/" element={currentUser ? <Home currentUser={currentUser} /> : <Navigate to="/login" />} />
          <Route path="/login" element={!currentUser ? <Login setCurrentUser={setCurrentUser} /> : <Navigate to="/" />} />
          <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
          <Route path="/profile/:username" element={<Profile currentUser={currentUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;