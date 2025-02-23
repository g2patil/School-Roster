import React, { useContext,useState,useEffect } from "react";
import "./AddEmployee.css";
import { AuthContext } from "../context/AuthContext";
//import { isSession } from "react-router-dom";
//import { useAuth } from "../context/AuthContext";
const AddEmployee = () => {
  const initialState = {
    employeeName: "",
    dateOfBirth: "",
    post: "",
    reservationCategory: "",
    educationQualification: "",
    otherQualification: "",
    dateOfJoining: "",
    dateOfRetirement: "",
    dateOfAppointment: "",
    dateOfPromotion: "",
    casteCertificateNumber: "",
    casteCertificateDate: "",
    casteCertificateIssuingAuthority: "",
    casteValidityCertificateNumber: "",
    casteValidityCertificateDate: "",
    committeeDetailsForCasteValidityCertificate: "",
    dateOfPromotionAppointment: "",
    comments: "",
    employeeCast: "",
    isActive: true,
    createdBy: "",
    bindu_Id: "",
    bindu_Code: "",
    bindu_Name: "",
    sevarth_Id: "",
    committee_Det_Caste_Validity_Cert_Number: "",
    committee_Det_Caste_Validity_Cert_Date: "",
    prof_Qualification: "",
    institute: { id: 1 },
    school: { id: 1 }
  };
  //const [binduCodes, setBinduCodes] = useState([]);

  // Fetch bindu codes from the API
 

  
  const [employee, setEmployee] = useState(initialState);
  const [isCreatedByVisible] = React.useState(true);
  const { user } = useContext(AuthContext);
  const [createdBy, setCreatedBy] = useState("");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
   // Default value

 // const [selectedReservation, setSelectedReservation] = useState('');
 useEffect(() => {
  if (user?.username) {
    setEmployee((prevEmployee) => ({
      ...prevEmployee,
      createdBy: user.username, // Set createdBy from logged-in user
    }));
  }
}, [user]);
  useEffect(() => {
    
    const fetchReservations = async () => {
      try {
        const response = await fetch('http://192.168.1.114:8082/adnya/resv/all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies (like SESSION ID)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Fetched Data:', data);
        setReservations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }


 // const { sessionId } = useAuth(); 
  /*const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('.')[0]; // Format as 'yyyy-MM-ddTHH:mm:ss'
  };*/

 // return fetch(url, options); // Proceed with the request if session is valid

 // const [ setIsSession] = useState(null);  // Session state
/*
  useEffect(() => {
    // Check if the session is valid (this is an example using localStorage)
    const sessionData = localStorage.getItem("sessionValid");  // Example using localStorage
    setIsSession(sessionData === "true");
  }, []);*/
   // Fetch data from the API when the component mounts
  

  const handleChange = (e) => {
    const { name, value } = e.target;
   // const formattedValue = name.includes("date") ? formatDate(value) : value;

    setEmployee({ ...employee, [name]: value });
  };





  const handleSubmit = (e) => {
    e.preventDefault();
     // Convert dates to Date objects for comparison

   

  const dob = new Date(employee.dateOfBirth);
  const joinDate = new Date(employee.joinDate);
  const dateOfAppointment = new Date(employee.dateOfAppointment);
  const dateOfPromotion = new Date(employee.dateOfPromotion);
  const dateOfRetirement = new Date(employee.dateOfRetirement);

  // Check business logic: Date of Birth < Join Date < Date of Appointment < Date of Promotion < Date of Retirement
  if (
    dob >= joinDate          || 
    dob >= dateOfAppointment || 
    dob >= dateOfPromotion   ||
    dob >= dateOfRetirement 
  ) {
    alert("Date of Birth must be earlier.");
    return;
  }

  if (
    joinDate <= dob               || 
    joinDate >= dateOfAppointment || 
    joinDate >= dateOfPromotion   ||
    joinDate >= dateOfRetirement 
  ) {
    alert("Join Date must be earlier than.");
    return;
  }

  if (
    dateOfAppointment <= dob               || 
    dateOfAppointment <= joinDate          || 
    dateOfAppointment >= dateOfPromotion   ||
    dateOfAppointment >= dateOfRetirement
  ) {
    alert("Date of Appointment must be earlier than.");
    return;
  }

  if (
    dateOfPromotion <= dob                 || 
    dateOfPromotion <= joinDate            || 
    dateOfPromotion <= dateOfAppointment   ||
    dateOfPromotion >= dateOfRetirement

  ) {
    alert("Date of Promotion must be earlier than Date of Retirement.");
    return;
  }

  if (
    dateOfRetirement <= dob                 || 
    dateOfRetirement <= joinDate            || 
    dateOfRetirement <= dateOfAppointment   ||
    dateOfRetirement <= dateOfPromotion

  ) {
    alert("Date of Promotion must be earlier than Date of Retirement.");
    return;
  }
    // Send the updated data with the new fields
    console.log("User Object:", user);
console.log("Username:", user?.username);

setCreatedBy(user.username); 

console.log("Final Payload:", JSON.stringify(employee)); 
    fetch("http://192.168.1.114:8082/adnya/EmployeeRoster/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include', 
      // withCredentials: true,
      body: JSON.stringify(employee),
    })
      .then((response) => {
        if (response.ok) {
        //  alert(sessionId +"-----Employee added successfully"+response.status+""+JSON.stringify(employee));
        alert("Employee added successfully");
        
      //  setEmployee(initialState);
        } else {
          alert("Failed to add employee");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while adding the employee.");
      });
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Add New Employee</h2>
      <form onSubmit={handleSubmit}>
        <table className="form-table">
          <tbody>
          
            <tr>
              <td>Bindu ID:</td>
              <td>
                <input
                  type="text"
                  name="bindu_Id"
                  value={employee.bindu_Id}
                  onChange={handleChange}
                />
              </td>
            </tr>

            <tr><td>Bindu Name:</td><td>
            <select
  name="bindu_Name"
  value={employee.bindu_Code}  // Use bindu_Code instead of bindu_Name
  onChange={(e) => {
    const selectedOption = reservations.find(
      (resv) => resv.resvCatId === parseInt(e.target.value)
    );
    setEmployee({
      ...employee,
      bindu_Name: selectedOption ? selectedOption.reservationCategory : "",
      bindu_Code: selectedOption ? selectedOption.resvCatId : "",
      reservationCategory: selectedOption ? selectedOption.resvCatId : "",
      
    });
  }}
>
  <option value="">-- Select --</option>
  {reservations.map((bindu) => (
    <option key={bindu.resvCatId} value={bindu.resvCatId}>
      {bindu.reservationCategory}
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
                  value={employee.sevarth_Id}
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
                  value={employee.employeeName}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>Date of Birth:</td>
              <td>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={employee.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>Date of Joining:</td>
              <td>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={employee.dateOfJoining}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            
            <tr>
              <td>Date of Appointment:</td>
              <td>
                <input
                  type="date"
                  name="dateOfAppointment"
                  value={employee.dateOfAppointment}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>Date of Promotion:</td>
              <td>
                <input
                  type="date"
                  name="dateOfPromotion"
                  value={employee.dateOfPromotion}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>Date of Retirement:</td>
              <td>
                <input
                  type="date"
                  name="dateOfRetirement"
                  value={employee.dateOfRetirement}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              
              <td>Post:</td>
              <td>
                <input
                  type="text"
                  name="post"
                  value={employee.post}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
         
            <tr>
              <td>Education Qualification:</td>
              <td>
                <input
                  type="text"
                  name="educationQualification"
                  value={employee.educationQualification}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>Other Qualification:</td>
              <td>
                <input
                  type="text"
                  name="otherQualification"
                  value={employee.otherQualification}
                  onChange={handleChange}
                />
              </td>
            </tr>
           
            <tr>
              <td>Caste Certificate Number:</td>
              <td>
                <input
                  type="text"
                  name="casteCertificateNumber"
                  value={employee.casteCertificateNumber}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>Caste Certificate Date:</td>
              <td>
                <input
                  type="date"
                  name="casteCertificateDate"
                  value={employee.casteCertificateDate}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>Caste Certificate Issuing Authority:</td>
              <td>
                <input
                  type="text"
                  name="casteCertificateIssuingAuthority"
                  value={employee.casteCertificateIssuingAuthority}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>Caste Validity Certificate Number:</td>
              <td>
                <input
                  type="text"
                  name="casteValidityCertificateNumber"
                  value={employee.casteValidityCertificateNumber}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>Caste Validity Certificate Date:</td>
              <td>
                <input
                  type="date"
                  name="casteValidityCertificateDate"
                  value={employee.casteValidityCertificateDate}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>Committee Details for Caste Validity Certificate:</td>
              <td>
                <input
                  type="text"
                  name="committeeDetailsForCasteValidityCertificate"
                  value={employee.committeeDetailsForCasteValidityCertificate}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>Date of Promotion Appointment:</td>
              <td>
                <input
                  type="date"
                  name="dateOfPromotionAppointment"
                  value={employee.dateOfPromotionAppointment}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>Comments:</td>
              <td>
                <textarea
                  name="comments"
                  value={employee.comments}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>Employee Cast:</td>
              <td>
                <input
                  type="text"
                  name="employeeCast"
                  value={employee.employeeCast}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>Is Active:</td>
              <td>
                <select
                  name="isActive"
                  value={employee.isActive}
                  onChange={handleChange}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </td>
            </tr>
           
            <tr>
              <td>Committee Caste Validity Certificate Number:</td>
              <td>
                <input
                  type="text"
                  name="committee_Det_Caste_Validity_Cert_Number"
                  value={employee.committee_Det_Caste_Validity_Cert_Number}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>Committee Caste Validity Certificate Date:</td>
              <td>
                <input
                  type="date"
                  name="committee_Det_Caste_Validity_Cert_Date"
                  value={employee.committee_Det_Caste_Validity_Cert_Date}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td>Professional Qualification:</td>
              <td>
                <input
                  type="text"
                  name="prof_Qualification"
                  value={employee.prof_Qualification}
                  onChange={handleChange}
                />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="text-center">
                <button type="submit" className="submit-button">
                  Add Employee
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default AddEmployee;

