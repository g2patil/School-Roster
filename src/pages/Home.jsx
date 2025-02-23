import React, { useState } from "react";
import "./Home.css";
import { Link } from "react-router-dom";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
                  </div>
        <div className={`menu-items ${isMenuOpen ? "active" : ""}`}>
          <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/Login">Login</Link></li>
          <li><a href="#contact">Contact</a></li>
         
          </ul>
        </div>
        <div className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="content">
        <h1>Welcome to My Website</h1>
        <p>This is the home page.</p>
      </div>
    </div>
  );
};

export default Home;
