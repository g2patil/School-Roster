import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Home.css";  // Ensure your CSS is linked

const Dashboard = () => {
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
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          {/* Add logo if necessary */}
        </div>
        <div className={`menu-items ${isMenuOpen ? "active" : ""}`}>
          <ul>
            <li><Link to="/dashboard/add-employee">Add Employee</Link></li>
            <li><Link to="/dashboard/edit-employee">Edit Employee</Link></li>
            <li><Link to="/dashboard/show-roster">Roster</Link></li>
            <li><Link to="/dashboard/show-goshwara">Goshwara</Link></li>
            <li><Link to="/dashboard/show-goshwara-by-cat">Goshwara By Cat</Link></li>
            <li><Link to="/dashboard/show-resv-dist">Resv Dist</Link></li>

            {/* Account Entry Menu with Submenu */}
            <li className="submenu">
              <button onClick={toggleSubMenu} 
             /* onMouseOver={() => setIsSubMenuOpen(true)} onMouseOut={() => 
              setIsSubMenuOpen(false)}*/
              
              
              className="submenu-btn">
                Account Entry
              </button>
              {isSubMenuOpen && (
                <ul className="submenu-items">
                  <li><Link to="/dashboard/add-school-accont">Add Account</Link></li>
                  <li><Link to="/dashboard/transaction-report">Account Report</Link></li>
                  <li><Link to="/dashboard/add-salary-accont">Add Salary Account</Link></li>
                  <li><Link to="/dashboard/comb-transaction-report">comb Account Report</Link></li>
                
                  
                  {/* You can add more links here as needed */}
                </ul>
              )}
            </li>

            <li>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </li>
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
        {/* Nested Routes Rendering */}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;



/*import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link,  Outlet, useNavigate } from "react-router-dom";
import "./Home.css";

const Dashboard = () => {
  //const { user } = useContext(AuthContext);
  const {  logout } = useContext(AuthContext);  // Get logout from context
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
      {}
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

      {}
      <div className="dashboard-content">
     {}
        {}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
*/