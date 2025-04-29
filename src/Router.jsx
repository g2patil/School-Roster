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
import Goshwara from "./pages/Goshwara";
import Goshwarabycat from "./pages/Goshwarabycat";
import AddSchoolTransaction from "./pages/AddSchoolTransaction";
import TransactionReport from "./pages/TransactionReport";
import CombTransactionReport from "./pages/CombTransactionReport";
import AddSalaryTransaction from "./pages/AddSalaryTransaction";
//import EditEmployee from "./pages/EmployeeEdit";

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
            <Route path="show-goshwara" element={<Goshwara />} />
            <Route path="show-goshwara-by-cat" element={<Goshwarabycat />} />
            <Route path="show-resv-dist" element={<ReservationDistribution />} />
            <Route path="add-school-accont" element={<AddSchoolTransaction />} />
            <Route path="transaction-report" element={<TransactionReport />} />
            <Route path="comb-transaction-report" element={<CombTransactionReport />} />
            <Route path="add-salary-accont" element={<AddSalaryTransaction />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
