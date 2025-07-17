import React, {  useContext, useState } from "react";
import "./Home.css";
import { AuthContext } from "../context/AuthContext";
import logo from "./img/logo.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import bgImage from "../img/bkg01.png";
const Home = () => {
  const { logout } = useContext(AuthContext);  // Get logout from context
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  const handleLogout = () => {
    logout();  // Clear user data
    navigate("/");  // Redirect to Home page
  };

  return (
    <div className="home-container"     >
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
           <img src={logo} alt="Logo" className="logo-img" />
          {/* Add logo if necessary */}
        </div>
        <div className={`menu-items ${isMenuOpen ? "active" : ""}`}>
          <ul>
            <li><Link to="/dashboard/add-employee">Home</Link></li>
            <li><Link to="/dashboard/edit-employee">Team</Link></li>
            <li><Link to="/dashboard/show-roster">Contact Us</Link></li>
            <li><Link to="/MainDash/Aboutus">About Us</Link></li>
            <li><Link to="/dashboard/show-goshwara-by-cat">Login</Link></li>
                    
          </ul>
        </div>
        <div className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </nav>

      {/* Main Content */console.log(bgImage)}
      <div className="dashboard-content">
  <div className="outlet-wrapper">
    <Outlet />
  </div>
</div>
    </div>
  );
};

export default Home;