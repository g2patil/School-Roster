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
      .get(`${config.API_URL}/EmployeeRoster/view`, {
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

  // Export to PDF
  const exportToPDF = () => {
  //  const doc = new jsPDF('landscape'); // Landscape for wide tables
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3'  // You can also use 'a3', 'a5', or custom array like [297, 210] for A4 Landscape
    });
    // Title
    doc.setFontSize(18);
    doc.text("Employee Roster", 14, 15);
    doc.setFontSize(12);
    doc.setTextColor(100);
  
    // Table content
    doc.autoTable({
      startY: 25,
      head: [
        [
          "Bindu ID",
          "Bindu Name",
          "Employee Name",
          "Reservation Category",
          "Bindu Name Mar",
          "Date of Promotion",
          "Date of Appointment",
          "Date of Birth",
          "Date of Retirement",
          "Caste Certificate No",
          "Caste Certificate Date",
          "Issuing Authority",
          "Validity Certificate No",
          "Validity Certificate Date",
          "Comments",
        ],
      ],
      body: employeeData.map((item) => [
        item.binduId,
        item.binduName,
        item.employeeName,
        item.reservationCategory,
        item.binduNameMar,
        item.dateOfPromotion,
        item.dateOfAppointment,
        item.dateOfBirth,
        item.dateOfRetirement,
        item.casteCertificateNumber,
        item.casteCertificateDate,
        item.casteCertificateIssuingAuthority,
        item.casteValidityCertificateNumber,
        item.casteValidityCertificateDate,
        item.comments,
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [22, 160, 133], // Custom header color
        textColor: 255,
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 15 },  // Bindu ID
        1: { cellWidth: 25 },  // Bindu Name
        2: { cellWidth: 30 },  // Employee Name
        3: { cellWidth: 30 },  // Reservation Category
        4: { cellWidth: 30 },  // Bindu Name Mar
        5: { cellWidth: 25 },  // Date of Promotion
        6: { cellWidth: 25 },  // Date of Appointment
        7: { cellWidth: 25 },  // Date of Birth
        8: { cellWidth: 25 },  // Date of Retirement
        9: { cellWidth: 30 },  // Caste Certificate No
        10: { cellWidth: 25 }, // Caste Certificate Date
        11: { cellWidth: 35 }, // Issuing Authority
        12: { cellWidth: 30 }, // Validity Certificate No
        13: { cellWidth: 25 }, // Validity Certificate Date
        14: { cellWidth: 40 }, // Comments
      },
      margin: { top: 25, bottom: 20 },
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Page ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
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
