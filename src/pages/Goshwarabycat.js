
import React, { useEffect, useState } from "react";
import config from "../config";
import jsPDF from "jspdf";
import "jspdf-autotable";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "../fonts/NotoFonts"; // adjust based on where your file is
import { AuthContext } from "../context/AuthContext";
import { useAuth } from '../context/AuthContext';



pdfMake.vfs = pdfFonts.vfs;

pdfMake.fonts = {
  NotoSansDevanagari: {
    normal: 'NotoSansDevanagari-Regular.ttf',
    bold: 'NotoSansDevanagari-Regular.ttf',
    italics: 'NotoSansDevanagari-Regular.ttf',
    bolditalics: 'NotoSansDevanagari-Regular.ttf'
  }
};

const Goshwara = () => {
  const [totalSeats, setTotalSeats] = useState(0);
 // const [resvSeats, setResvSeats] = useState(0);
  const [distribution, setDistribution] = useState([]);
  const [apiData, setApiData] = useState({});
  const [isVertical, setIsVertical] = useState(true);
 // let total_Remaining_Seats=0;
 // const [selectedDate, setSelectedDate] = useState("");
const [selectedDate, setSelectedDate] = useState(() => {
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  return today;
});
//const [calculatedReservations, setCalculatedReservations] = useState([]);
 
const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${config.API_URL}/EmployeeRoster/resv_per_by_date?s=${selectedDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies (like SESSION ID)
    })
      .then(response => response.json())
      .then(data => {
        // Transform the API data to match the desired format
        const transformed = data.map(item => ({
          id: item.id,
          name: item.bindu_name_mar, // category name
          percentage: item.bindu_nos        // category percentage
        }));
     //   setCategories(transformed);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  },[selectedDate]/*[categories, setCategories]*/);


  
//console.log(`${config.API_URL}/EmployeeRoster/summary/1?s=${selectedDate}`);

const [categoryPosts, setCategoryPosts] = useState([]);
/************
const [userInfo, setUserInfo] = useState(null);
useEffect(() => {
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Important if your backend uses sessions
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch user info");
      return res.json();
    })
    .then((data) => {
      console.log("User Info:", data); // For debug
      setUserInfo(data);
      console.log("2 User Info:", data);
    })
    .catch((err) => {
      console.error("Error fetching user info:", err);
    });
}, []);

const instituteId = userInfo.institute?.id;
/*************/
//console.log(selectedDate.trim());
//const { userInfo } = AuthContext();
const { userInfo } = useAuth();

const instituteId = userInfo?.institute?.id;
  useEffect(() => {
   // if (!userInfo || !userInfo.instituteId) return;
    fetch(`${config.API_URL}/EmployeeRoster/goshwara_by_cat?s=${userInfo.instituteId}`, {
     // fetch(`${config.API_URL}/EmployeeRoster/goshwara_by_cat?s=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies (like SESSION ID)
    }) .then(response => response.json())
    .then(data => {
      // Transform the API data to match the desired format
      const transformed = data.map(item => ({
        reservation_category: item.reservation_category,
        bindu_name_mar: item.bindu_name_mar, // category name
        percentage: item.percentage,
        bindu_nos: item.bindu_nos ,
        fill_nos: item.fill_nos 
               // category percentage
      }));
      setCategories(transformed);
    })
     // .then((response) => response.text()) // Get raw response as text
     
     
      .catch((error) => console.error("Error fetching API data:", error));
  }, [selectedDate], [userInfo]); 
  
  const handleSeatsChange = (e) => {
    const value = Number(e.target.value);
 //   setTotalSeats(value);
 //   setResvSeats(value);
  };


    const calculateDistribution = () => {
    let allocatedSeats = 0;
    let calculated = categories.map((category) => {
     
      return {
        reservation_category: category.reservation_category,
        bindu_name_mar: category.bindu_name_mar,
        bindu_nos: category.bindu_nos,
        percentage: category.percentage,
        fill_nos: category.fill_nos
            };
    });

   

    setDistribution(calculated);
  };

  /************ */
 
  const generatePDF = () => {
  const doc = new jsPDF(); // Landscape A4
  
    const table = document.getElementById("t1"); // Select your table
  
    if (!table) {
      console.error("Table not found!");
      return;
    }
  
    // Extract table headers
    const headers = [...table.querySelectorAll("thead tr th")].map(th =>
      th.innerText.trim()
    );
    
    // Extract table data rows
    const data = [...table.querySelectorAll("tbody tr")].map(row => {
      return [...row.querySelectorAll("td")].map(td => td.innerText.trim());
    });
   // doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", `${config.ndBase64}`);
   // doc.addFont("NotoSansDevanagari-Regular.ttf", "NotoSansDevanagari", "normal");
  //  doc.setFont("NotoSansDevanagari");
   // doc.setFontSize(12);

  
   // doc.text("अनुसूचित जाती (SC)", 10, 10); // Sample Marathi text
    doc.setProperties({
      title: "My PDF",
      subject: "Test",
      author: "Me",
      keywords: "pdf, test, unicode",
    });
  //  doc.save("report.pdf");


    
    doc.autoTable({
      head: [headers], // Table Headers
      body: data, // Table Data
      startY: 20, // Positioning in PDF
      styles: {
        fontSize: 8,
        font: "NotoSansDevanagari",
        cellPadding: 1,
        halign: "center", // Center align text
        valign: "middle",
        lineWidth: 0.025, // Ensure cell border thickness
        lineColor: [0, 0, 0], // Black border
      },
      headStyles: {
        fillColor: [41, 128, 185], // Blue Header Background
        textColor: 255,
        fontSize: 12,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255], // Light Gray Alternate Row
      }, 
      html: '#t1',
      tableWidth: 'auto',
    });
   // doc.text("नमस्कार, ही मराठी भाषा आहे!", 10, 20);
pdfMake.createPdf(doc).open();
    doc.save("goshwara.pdf");
  };

  
  

  
/****** */

  return (
    <div className="form-container">
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-4xl text-center border border-gray-300">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-blue-500 pb-2">
        
        <h3 className="font-bold mt-3">Calculated Reservation Posts:</h3>
     
        
        <p>&nbsp;</p>
          Enter No of Post to be Filled
        </h2>
        
        <input
          type="date"
          value={selectedDate}
         onChange={(e) => {
    console.log("New selected date:", e.target.value);
    setSelectedDate(e.target.value);
  }}
          className="border border-gray-400 p-3 rounded w-full mb-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="number"
          value={totalSeats}
       //   onChange={(e) => setTotalSeats(Number(e.target.value))}
       //   value={resvSeats} // You can also use totalSeats; both will have the same value
          onChange={handleSeatsChange}

          placeholder="Enter total seats"
          className="border border-gray-400 p-3 rounded w-full mb-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={calculateDistribution}
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 shadow-md transition duration-300 mb-4"
        >
          Calculate Distribution
        </button>

        <button
          onClick={() => setIsVertical(!isVertical)}
          className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 shadow-md transition duration-300 mb-4"
        >
          Toggle View ({isVertical ? "Horizontal" : "Vertical"})
        </button>

        <button
  onClick={generatePDF}
  className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 shadow-md transition duration-300 mb-4"
>
  Download PDF
</button>
<p>&nbsp;</p>
        {distribution.length > 0 && (
          <div className="overflow-x-auto max-h-96">
            {isVertical ? (
            <table id="t1" width="88%" border="1">
            <thead>
                <tr><td colspan="6">​परिशिष्ट -4 </td></tr>
                <tr><td colspan="6">कार्यरत व वापरलेला बिंदूंचा तक्ता </td></tr>
                <tr><td colspan="6">लेखालिपिक संवर्गाचा बिंदुनिहाय प्रवर्गाचा गोषवारा </td></tr>
              <tr className="bg-blue-600 text-white text-lg font-semibold border border-gray-400">
                <th className="py-4 px-6 border border-gray-400 text-left"> प्रवर्ग क्रमांक</th>
                <th className="py-4 px-6 border border-gray-400 text-left">प्रवर्गाचे नाव</th>
                <th className="py-4 px-6 border border-gray-400 text-right">Percentage</th>
                <th className="py-4 px-6 border border-gray-400 text-right">वापरलेले बिंदू </th>
                <th className="py-4 px-6 border border-gray-400 text-right">मंजूर पदे </th> 
             
              <th className="py-4 px-6 border border-gray-400 text-right">कार्यरत पदे </th>
              </tr>
            </thead>
            <tbody>
              {distribution.map((cat, index) => (
                <tr
                  key={cat.reservation_category}
                  className={`${index % 2 === 0 ? "bg-gray-200" : "bg-white"} hover:bg-gray-300 border border-gray-400`}
                >
                  <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-left">{cat.reservation_category}</td>
                  <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-left">{cat.bindu_name_mar}</td>
                  <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right">{cat.percentage}%</td>
                  <td style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}> {cat.bindu_nos} </td>
                  <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right">{}</td>
                  <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right">{cat.fill_nos}</td>
                </tr>
                
              ))}
                
            </tbody>
          </table>
          
            ) : (
              
                <table id="t1" width="88%" border="1" >
                <thead>
                    <tr><td colspan="6">​परिशिष्ट -4 </td></tr>
                    <tr><td colspan="6">कार्यरत व वापरलेला बिंदूंचा तक्ता </td></tr>
                    <tr><td colspan="6">लेखालिपिक संवर्गाचा बिंदुनिहाय प्रवर्गाचा गोषवारा </td></tr>
                  <tr className="bg-blue-600 text-white text-lg font-semibold border border-gray-400">
                    <th className="py-4 px-6 border border-gray-400 text-left">प्रवर्ग क्रमांक</th>
                    <th className="py-4 px-6 border border-gray-400 text-left">प्रवर्गाचे नाव</th>
                    <th className="py-4 px-6 border border-gray-400 text-right">Percentage</th>
                    <th className="py-4 px-6 border border-gray-400 text-right">वापरलेले बिंदू </th>
                    <th className="py-4 px-6 border border-gray-400 text-right">मंजूर पदे </th> 
                 
                  <th className="py-4 px-6 border border-gray-400 text-right">कार्यरत पदे </th>
                  </tr>
                </thead>
                <tbody>
                  {distribution.map((cat, index) => (
                    <tr
                      key={cat.reservation_category}
                      className={`${index % 2 === 0 ? "bg-gray-200" : "bg-white"} hover:bg-gray-300 border border-gray-400`}
                    >
                      <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-left">{cat.reservation_category}</td>
                      <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-left">{cat.bindu_name_mar}</td>
                      <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right">{cat.percentage}%</td>
                      <td style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}> {cat.bindu_nos} </td>
                      <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right">{}</td>
                      <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right">{cat.fill_nos}</td>
                    </tr>
                    
                  ))}
                    
                </tbody>
              </table>


            )}



          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Goshwara;