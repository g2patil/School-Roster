import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link,  Outlet, useNavigate } from "react-router-dom";
import "./Home.css";

const Dashboard = () => {
  //const { user } = useContext(AuthContext);
  const { /*user,*/ logout } = useContext(AuthContext);  // Get logout from context
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();             // Clear user data
    navigate("/");        // Redirect to Home page
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
       
        </div>
        <div className={`menu-items ${isMenuOpen ? "active" : ""}`}>
          <ul>
          <ul>
  <li><Link to="/dashboard/add-employee">Add Employee</Link></li>
  <li><Link to="/dashboard/edit-employee">Edit Employee</Link></li>
  <li><Link to="/dashboard/show-roster"> Roster</Link></li>
  <li><Link to="/dashboard/show-goshwara"> Goshwara</Link></li>
  <li><Link to="/dashboard/show-goshwara-by-cat"> Goshwara By Cat</Link></li>
  <li><Link to="/dashboard/show-resv-dist"> Resv Dist</Link></li>
  <li><Link to="/dashboard/add-school-accont">Account Entry</Link></li>
  <li>
              <button 
                onClick={handleLogout} 
                
                  >
                Logout
              </button>
            </li>
</ul>
          </ul>
        </div>
        <div className="hamburger" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
     {/* <h1 align="center">Welcome, {user?.username}!</h1>
        <h2 align="center">Manage Employees & Roster</h2>
*/}
        {/* Nested Routes Rendering */}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
