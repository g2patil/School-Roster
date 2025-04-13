import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import config from "../config";
import "./AddEmployee.css";
import { AuthContext } from "../context/AuthContext";

const EditEmployee = () => {
  const { id: paramId } = useParams();
  const { user } = useContext(AuthContext);

  const [inputId, setInputId] = useState(paramId || ""); // editable ID
  const [employee, setEmployee] = useState(getInitialEmployee());
  const [reservations, setReservations] = useState([]);

  function getInitialEmployee() {
    return {
      bindu_Id: "",
      bindu_Name: "",
      bindu_Code: "",
      sevarth_Id: "",
      employeeName: "",
      dateOfBirth: "",
      dateOfJoining: "",
      dateOfAppointment: "",
      dateOfPromotion: "",
      dateOfRetirement: "",
      post: "",
      educationQualification: "",
      otherQualification: "",
      casteCertificateNumber: "",
      casteCertificateDate: "",
      casteCertificateIssuingAuthority: "",
      casteValidityCertificateNumber: "",
      casteValidityCertificateDate: "",
      committeeDetailsForCasteValidityCertificate: "",
      dateOfPromotionAppointment: "",
      comments: "",
      employeeCast: "",
      prof_Qualification: ""
    };
  }
  function handleInputIdChange(e) {
    const newId = e.target.value;
    setInputId(newId);
    setEmployee(getInitialEmployee); // This will reset all fields
  }
  useEffect(() => {
    fetchReservations();
    if (paramId) {
      fetchEmployeeById(paramId);
    }
  }, [paramId]);


  const resetEmployeeFields = () => {
    setEmployee({
      bindu_Id: "",
      bindu_Name: "",
      bindu_Code: "",
      sevarth_Id: "",
      employeeName: "",
      dateOfBirth: "",
      dateOfJoining: "",
      dateOfAppointment: "",
      dateOfPromotion: "",
      dateOfRetirement: "",
      post: "",
      educationQualification: "",
      otherQualification: "",
      casteCertificateNumber: "",
      casteCertificateDate: "",
      casteCertificateIssuingAuthority: "",
      casteValidityCertificateNumber: "",
      casteValidityCertificateDate: "",
      committeeDetailsForCasteValidityCertificate: "",
      dateOfPromotionAppointment: "",
      comments: "",
      employeeCast: "",
      prof_Qualification: ""
    });
  };
  

  const fetchEmployeeById = async (empId) => {
    try {
      const res = await fetch(`${config.API_URL}/EmployeeRoster/fetch/${empId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Employee not found");
      const data = await res.json();
      setEmployee(data);
    } catch (err) {
      console.error("Error fetching employee:", err);
      alert("Failed to fetch employee. Please check the ID.");
      resetEmployeeFields();
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${config.API_URL}/resv/all`, {
        credentials: "include",
      });
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleReservationChange = (e) => {
    const selected = reservations.find(
      (r) => r.resvCatId === parseInt(e.target.value)
    );
    if (selected) {
      setEmployee({
        ...employee,
        bindu_Name: selected.reservationCategory,
        bindu_Code: selected.resvCatId,
        reservationCategory: selected.resvCatId,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("$$$$ "+inputId);
    try {
      const res = await fetch(`${config.API_URL}/EmployeeRoster/update/${inputId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(employee),
      });

      if (res.ok) {
        alert("Employee updated successfully");
        resetEmployeeFields();
      } else {
        alert("Failed to update employee");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating employee");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Edit Employee</h2>

      {/* ID input and Fetch Button */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Enter Employee ID:{" "}
          <input
            type="text"
            value={inputId}
            onChange={handleInputIdChange}
          />
        </label>
        <button
          type="button"
          onClick={() => fetchEmployeeById(inputId)}
          style={{ marginLeft: "10px" }}
        >
          Fetch
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <table className="form-table">
          <tbody>
            <tr>
              <td>Bindu ID:</td>
              <td>
                <input
                  type="text"
                  name="bindu_Id"
                  value={employee.bindu_Id || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr>
              <td>Bindu Name:</td>
              <td>
                <select
                  name="reservationCategory"
                  value={employee.reservationCategory || ""}
                  onChange={handleReservationChange}
                >
                  <option value="">-- Select --</option>
                  {reservations.map((r) => (
                    <option key={r.resvCatId} value={r.resvCatId}>
                      {r.reservationCategory}
                    </option>
                  ))}
                </select>
              </td>
            </tr>

            <tr>
              <td>Sevarth ID:</td>
              <td>
                <input
                  type="text"
                  name="sevarth_Id"
                  value={employee.sevarth_Id || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr>
              <td>Employee Name:</td>
              <td>
                <input
                  type="text"
                  name="employeeName"
                  value={employee.employeeName || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

          

            <tr>
              <td>Post:</td>
              <td>
                <input
                  type="text"
                  name="post"
                  value={employee.post || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr>
              <td>Education Qualification:</td>
              <td>
                <input
                  type="text"
                  name="educationQualification"
                  value={employee.educationQualification || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

          

            <tr>
              <td>Date of Birth:</td>
              <td>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={employee.dateOfBirth || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>


            <tr>
              <td>Date of Joining:</td>
              <td>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={employee.dateOfJoining || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>


            <tr>
              <td>Appointment Date:</td>
              <td>
                <input
                  type="date"
                  name="dateOfAppointment"
                  value={employee.dateOfAppointment || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>


            <tr>
              <td>Promotion Date:</td>
              <td>
                <input
                  type="date"
                  name="dateOfPromotion"
                  value={employee.dateOfPromotion || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>


            <tr>
              <td>Retirement Date:</td>
              <td>
                <input
                  type="date"
                  name="dateOfRetirement"
                  value={employee.dateOfRetirement || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr>
              <td>Caste:</td>
              <td>
                <input
                  type="text"
                  name="caste"
                  value={employee.employeeCast || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

           

         

            <tr>
              <td>caste Certificate Number:</td>
              <td>
                <input
                  type="text"
                  name="casteCertificateNumber"
                  value={employee.casteCertificateNumber || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr>
              <td>caste Certificate Date:</td>
              <td>
                <input
                  type="date"
                  name="casteCertificateDate"
                  value={employee.casteCertificateDate || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr>
              <td>caste Validity Certificate Number:</td>
              <td>
                <input
                  type="text"
                  name="casteValidityCertificateNumber"
                  value={employee.casteValidityCertificateNumber || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr>
              <td>caste Validity Certificate Date:</td>
              <td>
                <input
                  type="date"
                  name="casteValidityCertificateDate"
                  value={employee.casteValidityCertificateDate || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>



            <tr>
              <td>comments:</td>
              <td>
                <input
                  type="text"
                  name="comments"
                  value={employee.comments || ""}
                  onChange={handleChange}
                />
              </td>
            </tr>

          

            <tr>
              <td></td>
              <td>
                <button type="submit">Update</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default EditEmployee;
