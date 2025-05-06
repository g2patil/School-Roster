import React, { useState, useEffect } from 'react';
import "./dashboard_01.css";
import logo from '../img/logo.png';  
const Dashboard_01 = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
  
    const toggleMenu = () => {
      setMenuOpen(!menuOpen);
    };
  
    const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
    };
  
    const handleLogout = () => {
      alert('Logged out');
      // Your logout logic
    };

    // Close dropdown if clicked outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.dropdown')) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, []);
  
    return (
      <nav className="navbar">
        <div className="navbar-left">
        <img src={logo} className="logo" alt="Logo" />
          {/* Add logo or brand details here if needed */}
        </div>
  
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
  
        <div className={`navbar-right ${menuOpen ? 'open' : ''}`}>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <div className="dropdown">
            <button onClick={toggleDropdown}>Menu </button>
            {dropdownOpen && (
              <div className="dropdown-content">
                <a href="#profile">Profile</a>
                <a href="#settings">Settings</a>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

export default Dashboard_01;
