import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/useAlert.js';
import '../styles/Navbar.css';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleLogout = () => {
    console.log('Navbar: handleLogout called.');
    onLogout();
    showAlert('You have been logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to="/dashboard">Monthly P&L</NavLink>
        </div>
        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/income" className="nav-link">Income</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/expenses" className="nav-link">Expenses</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/liabilities" className="nav-link">Liabilities</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/settings" className="nav-link">Settings</NavLink>
          </li>
        </ul>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;