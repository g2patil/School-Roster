import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import ShowRoster from "./pages/ShowRoster";
import ReservationDistribution from "./pages/ReservationDistribution";

const AppRouter = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Parent Dashboard Route with Nested Routes */}
          <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route path="add-employee" element={<AddEmployee />} />
            <Route path="edit-employee" element={<EditEmployee />} />
            <Route path="show-roster" element={<ShowRoster />} />
            <Route path="show-resv-dist" element={<ReservationDistribution />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
