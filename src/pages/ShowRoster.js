import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import config from "../config";

const ShowRoster = () => {
  const [employeeData, setEmployeeData] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    axios
      .get(`${config.API_URL}/EmployeeRoster/inst/1`, {
        withCredentials: true, // Include cookies
      })
      .then((response) => {
        console.log("API Response:", response.data);
        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else {
          console.error("Unexpected data format:", response.data);
          setEmployeeData([]);
          return;
        }

        // Optional: Sort by a specific field if needed, e.g., by binduId
        data.sort((a, b) => a.binduId - b.binduId);

        setEmployeeData(data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a2",
    });
  
    // Define content for header
    const title = "Employee Roster";
    const instituteName = "XYZ Institute"; // Change to your actual institute name
    const reportDate = `Report Date: ${new Date().toLocaleDateString()}`;
    const userName = "Generated by: John Doe"; // Change to the actual user name
  
    // Get PDF page width to center text
    const pageWidth = doc.internal.pageSize.width;
  
    // Title (Centered)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 15);
  
    // Institute Name (Centered)
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    const instituteWidth = doc.getTextWidth(instituteName);
    doc.text(instituteName, (pageWidth - instituteWidth) / 2, 25);
  
    // Report Date and User Name (Centered)
    doc.setFontSize(12);
    const reportWidth = doc.getTextWidth(reportDate);
    const userWidth = doc.getTextWidth(userName);
    doc.text(reportDate, (pageWidth - reportWidth) / 2, 35);
    doc.text(userName, (pageWidth - userWidth) / 2, 45);
  
    // Table content
    doc.autoTable({
      startY: 55, // Adjusted start position below the headers
      head: [
        [
          "Bindu ID",
          "Bindu Name",
          "Employee Name",
          "Reservation Category",
          "Date of Promotion",
          "Date of Appointment",
          "Date of Birth",
          "Date of Retirement",
          "Caste Certificate No/Date",
          "Validity Certificate No/Date",
          "Issuing Authority",
          "Comments",
        ],
      ],
      body: employeeData.map((item) => [
        item.binduId,
        item.binduName,
        item.employeeName,
        item.reservationCategory,
        item.dateOfPromotion,
        item.dateOfAppointment,
        item.dateOfBirth,
        item.dateOfRetirement,
        item.casteCertificateNumber + " / " + item.casteCertificateDate,
        item.casteValidityCertificateNumber+" / "+
        item.casteValidityCertificateDate,
        item.casteCertificateIssuingAuthority ,
        item.comments,
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [22, 160, 133], // Custom header color
        textColor: 255,
        fontSize: 14,
      },
      bodyStyles: {
        fontSize: 14,
      },
      styles: {
        overflow: "linebreak",
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Bindu ID
        1: { cellWidth: 30 }, // Bindu Name
        2: { cellWidth: 70 }, // Employee Name
        3: { cellWidth: 40 }, // Reservation Category
        4: { cellWidth: 35 }, // Date of Promotion
        5: { cellWidth: 35 }, // Date of Appointment
        6: { cellWidth: 35 }, // Date of Birth
        7: { cellWidth: 35 }, // Date of Retirement
        8: { cellWidth: 70 }, // Caste Certificate No
        9: { cellWidth: 60 }, // Issuing Authority
        10: { cellWidth: 60 }, // Validity Certificate No
        11: { cellWidth: 60 }, // Comments
      },
      margin: { top: 25, bottom: 20 },
      didDrawPage: (data) => {
        // Footer (Page Number)
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(14);
        doc.text(`Page ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      },
    });
  
    // Save the PDF
    doc.save("EmployeeRoster.pdf");
  };
  
 
  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(employeeData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EmployeeRoster");
    XLSX.writeFile(workbook, "EmployeeRoster.xlsx");
  };

  return (
    <div style={{ textAlign: "center" }}>
     
      <div
  style={{
    width: "80%",
    margin: "0 auto",
    maxHeight: "400px", // Adjust height as needed
    overflowY: "auto",
    border: "1px solid black",
  }}
> <h1>Employee Roster</h1>
  <table
    border="1"
    style={{
      width: "100%",
      borderCollapse: "collapse",
      textAlign: "center",
    }}
  >
    <thead
      style={{
        position: "sticky",
        top: 0,
        backgroundColor: "#fff",
        zIndex: 2,
      }}
    >
      <tr>
        <th>Bindu ID</th>
        <th>Bindu Name</th>
        <th>Employee Name</th>
        <th>Reservation Category</th>
        <th>Bindu Name Mar</th>
        <th>Date of Promotion</th>
        <th>Date of Appointment</th>
        <th>Date of Birth</th>
        <th>Date of Retirement</th>
        <th>Caste Certificate No</th>
        <th>Caste Certificate Date</th>
        <th>Issuing Authority</th>
        <th>Validity Certificate No</th>
        <th>Validity Certificate Date</th>
        <th>Comments</th>
      </tr>
    </thead>
    <tbody>
      {Array.isArray(employeeData) &&
        employeeData.map((item, index) => (
          <tr key={index}>
            <td>{item.binduId}</td>
            <td>{item.binduName}</td>
            <td>{item.employeeName}</td>
            <td>{item.reservationCategory}</td>
            <td>{item.binduNameMar}</td>
            <td>{item.dateOfPromotion}</td>
            <td>{item.dateOfAppointment}</td>
            <td>{item.dateOfBirth}</td>
            <td>{item.dateOfRetirement}</td>
            <td>{item.casteCertificateNumber}</td>
            <td>{item.casteCertificateDate}</td>
            <td>{item.casteCertificateIssuingAuthority}</td>
            <td>{item.casteValidityCertificateNumber}</td>
            <td>{item.casteValidityCertificateDate}</td>
            <td>{item.comments}</td>
          </tr>
        ))}
    </tbody>
  </table>
</div>
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={exportToPDF}
          style={{
            margin: "10px",
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Export to PDF
        </button>
        <button
          onClick={exportToExcel}
          style={{
            margin: "10px",
            padding: "10px 20px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default ShowRoster;
/*
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import config from "../config";

const ShowRoster = () => {
  const [employeeData, setEmployeeData] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    axios
      .get(`${config.API_URL}/EmployeeRoster/inst/1`, {
        withCredentials: true, // Include cookies
      })
      .then((response) => {
        console.log("API Response:", response.data);
        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else {
          console.error("Unexpected data format:", response.data);
          setEmployeeData([]);
          return;
        }

        // Optional: Sort by a specific field if needed, e.g., by binduId
        data.sort((a, b) => a.binduId - b.binduId);

        setEmployeeData(data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a2",
    });
  
    // Define content for header
    const title = "Employee Roster";
    const instituteName = "XYZ Institute"; // Change to your actual institute name
    const reportDate = `Report Date: ${new Date().toLocaleDateString()}`;
    const userName = "Generated by: John Doe"; // Change to the actual user name
  
    // Get PDF page width to center text
    const pageWidth = doc.internal.pageSize.width;
  
    // Title (Centered)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 15);
  
    // Institute Name (Centered)
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    const instituteWidth = doc.getTextWidth(instituteName);
    doc.text(instituteName, (pageWidth - instituteWidth) / 2, 25);
  
    // Report Date and User Name (Centered)
    doc.setFontSize(12);
    const reportWidth = doc.getTextWidth(reportDate);
    const userWidth = doc.getTextWidth(userName);
    doc.text(reportDate, (pageWidth - reportWidth) / 2, 35);
    doc.text(userName, (pageWidth - userWidth) / 2, 45);
  
    // Table content
    doc.autoTable({
      startY: 55, // Adjusted start position below the headers
      head: [
        [
          "Bindu ID",
          "Bindu Name",
          "Employee Name",
          "Reservation Category",
          "Date of Promotion",
          "Date of Appointment",
          "Date of Birth",
          "Date of Retirement",
          "Caste Certificate No/Date",
          "Validity Certificate No/Date",
          "Issuing Authority",
          "Comments",
        ],
      ],
      body: employeeData.map((item) => [
        item.binduId,
        item.binduName,
        item.employeeName,
        item.reservationCategory,
        item.dateOfPromotion,
        item.dateOfAppointment,
        item.dateOfBirth,
        item.dateOfRetirement,
        item.casteCertificateNumber + " / " + item.casteCertificateDate,
        item.casteValidityCertificateNumber+" / "+
        item.casteValidityCertificateDate,
        item.casteCertificateIssuingAuthority ,
        item.comments,
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [22, 160, 133], // Custom header color
        textColor: 255,
        fontSize: 14,
      },
      bodyStyles: {
        fontSize: 14,
      },
      styles: {
        overflow: "linebreak",
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Bindu ID
        1: { cellWidth: 30 }, // Bindu Name
        2: { cellWidth: 70 }, // Employee Name
        3: { cellWidth: 40 }, // Reservation Category
        4: { cellWidth: 35 }, // Date of Promotion
        5: { cellWidth: 35 }, // Date of Appointment
        6: { cellWidth: 35 }, // Date of Birth
        7: { cellWidth: 35 }, // Date of Retirement
        8: { cellWidth: 70 }, // Caste Certificate No
        9: { cellWidth: 60 }, // Issuing Authority
        10: { cellWidth: 60 }, // Validity Certificate No
        11: { cellWidth: 60 }, // Comments
      },
      margin: { top: 25, bottom: 20 },
      didDrawPage: (data) => {
        // Footer (Page Number)
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(14);
        doc.text(`Page ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      },
    });
  
    // Save the PDF
    doc.save("EmployeeRoster.pdf");
  };
  
 
  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(employeeData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EmployeeRoster");
    XLSX.writeFile(workbook, "EmployeeRoster.xlsx");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Employee Roster</h1>
      <table
        border="1"
        style={{
          margin: "0 auto",
          borderCollapse: "collapse",
          width: "80%",
          textAlign: "center",
        }}
      >
        <thead>
          <tr>
            <th>Bindu ID</th>
            <th>Bindu Name</th>
            <th>Employee Name</th>
            <th>Reservation Category</th>
            <th>Bindu Name Mar</th>
            <th>Date of Promotion</th>
            <th>Date of Appointment</th>
            <th>Date of Birth</th>
            <th>Date of Retirement</th>
            <th>Caste Certificate No</th>
            <th>Caste Certificate Date</th>
            <th>Issuing Authority</th>
            <th>Validity Certificate No</th>
            <th>Validity Certificate Date</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(employeeData) &&
            employeeData.map((item, index) => (
              <tr key={index}>
                <td>{item.binduId}</td>
                <td>{item.binduName}</td>
                <td>{item.employeeName}</td>
                <td>{item.reservationCategory}</td>
                <td>{item.binduNameMar}</td>
                <td>{item.dateOfPromotion}</td>
                <td>{item.dateOfAppointment}</td>
                <td>{item.dateOfBirth}</td>
                <td>{item.dateOfRetirement}</td>
                <td>{item.casteCertificateNumber}</td>
                <td>{item.casteCertificateDate}</td>
                <td>{item.casteCertificateIssuingAuthority}</td>
                <td>{item.casteValidityCertificateNumber}</td>
                <td>{item.casteValidityCertificateDate}</td>
                <td>{item.comments}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={exportToPDF}
          style={{
            margin: "10px",
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Export to PDF
        </button>
        <button
          onClick={exportToExcel}
          style={{
            margin: "10px",
            padding: "10px 20px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default ShowRoster;
*/