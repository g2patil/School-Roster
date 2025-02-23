
// App.js
/*
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import ShowRoster from "./pages/ShowRoster";
import Home from "./pages/Home"; // Assuming you have a Home page
import Login from "./pages/Login"; // Login page

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {}
        <Route path="/dashboard/*" element={<Dashboard />}>
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="edit-employee" element={<EditEmployee />} />
          <Route path="show-roster" element={<ShowRoster />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
*/
import React from 'react';
//import Home from './pages/Home'; // Ensure this path is correct
import Router from './Router'; 

import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import ShowRoster from "./pages/ShowRoster";
import Home from "./pages/Home"; // Assuming you have a Home page
import Login from "./pages/Login"; // Login page
const App = () => {
  return <Router>
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {}
        <Route path="/dashboard/*" element={<Dashboard />}>
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="edit-employee" element={<EditEmployee />} />
          <Route path="show-roster" element={<ShowRoster />} />
        </Route>
      </Routes>
  </Router> ;
};

export default App;
