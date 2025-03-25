
import React, { useEffect, useState } from "react";
import config from "../config";
import jsPDF from "jspdf";
import "jspdf-autotable";


const Goshwara = () => {
  const [totalSeats, setTotalSeats] = useState(0);
  const [resvSeats, setResvSeats] = useState(0);
  const [distribution, setDistribution] = useState([]);
  const [apiData, setApiData] = useState({});
  const [isVertical, setIsVertical] = useState(true);
  let total_Remaining_Seats=0;
 // const [selectedDate, setSelectedDate] = useState("");
const [selectedDate, setSelectedDate] = useState(() => {
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  return today;
});
const [calculatedReservations, setCalculatedReservations] = useState([]);
 
  const categories = [
    { id: 1, name: "अनुसूचित जाती (SC)", percentage: 13 },
    { id: 2, name: "अनुसूचित जमाती (ST)", percentage: 7 },
    { id: 3, name: "भटक्या जमाती - NT-A (VJ/DT)", percentage: 3 },
    { id: 4, name: "भटक्या जमाती - NT-B", percentage: 2.5 },
    { id: 5, name: "भटक्या जमाती - NT-C (धनगर)", percentage: 3.5 },
    { id: 6, name: "भटक्या जमाती - NT-D", percentage: 2 },
    { id: 7, name: "विशेष मागास वर्ग (SBC)", percentage: 2 },
    { id: 8, name: "इतर मागासवर्ग (OBC)", percentage: 19 },
    { id: 9, name: "मराठा (SEBC अंतर्गत)", percentage: 10 },
    { id: 10, name: "आर्थिक दुर्बल घटक (EWS)", percentage: 10 },
    { id: 11, name: "सामान्य प्रवर्ग (Open)", percentage: 28 },
  ];
//console.log(`${config.API_URL}/EmployeeRoster/summary/1?s=${selectedDate}`);

const [categoryPosts, setCategoryPosts] = useState([]);
/************* */
useEffect(() => {
  if (!selectedDate) return;

  fetch(`${config.API_URL}/EmployeeRoster/resv_by_date?s=${selectedDate}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.text())
    .then((text) => {
      console.log("Raw **********:", text);
      try {
        const jsonData = JSON.parse(text);
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          calculateReservationPosts(jsonData);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    })
    .catch((error) => console.error("Error fetching API data:", error));
}, [selectedDate, resvSeats]);

const calculateReservationPosts = (apiData) => {
  if (resvSeats <= 0) return;

  const calculatedPosts = apiData.map(({ resv_cat }) => {
    const category = categories.find((cat) => cat.id === Number(resv_cat));
    if (!category) return null;

    return {
      name: category.name,
      per: Math.round((category.percentage) ),
      
    };
  }).filter(Boolean);
 
  setCategoryPosts(calculatedPosts);
};
 
/*************/
//console.log(selectedDate.trim());
  useEffect(() => {
    fetch(`${config.API_URL}/EmployeeRoster/summary/1?s=${selectedDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies (like SESSION ID)
    })
      .then((response) => response.text()) // Get raw response as text
      .then((text) => {
      //  console.log("Raw API Response:", text); // Log the response before parsing
        try {
          const jsonData = JSON.parse(text); // Try parsing as JSON
        //  console.log("Parsed JSON:", jsonData);
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            setApiData(jsonData[0]); // Set state if JSON is valid
           // setEmployeeData(jsonData[0]);
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      })
      .catch((error) => console.error("Error fetching API data:", error));
  }, [selectedDate]); 
  
  const handleSeatsChange = (e) => {
    const value = Number(e.target.value);
    setTotalSeats(value);
    setResvSeats(value);
    total_Remaining_Seats = distribution.reduce(
    (total, { allocatedSeats, filledSeats }) => total + (allocatedSeats - filledSeats),
    0
  );
  };


    const calculateDistribution = () => {
    let allocatedSeats = 0;
    let calculated = categories.map((category) => {
      const seats = Math.round((category.percentage / 100) * totalSeats);
      allocatedSeats += seats;
      return {
        id: category.id,
        name: category.name,
        percentage: category.percentage,
        allocatedSeats: seats,
        filledSeats: apiData[category.id] ? parseInt(apiData[category.id], 10) : 0, // Get filled data by ID
      };
    });

    // Adjust Open Category seats if there's a rounding difference
    const openCategory = calculated.find((cat) => cat.id === 11);
    if (openCategory) {
      openCategory.allocatedSeats += totalSeats - allocatedSeats;
    }

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
    doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", `${config.ndBase64}`);
    doc.addFont("NotoSansDevanagari-Regular.ttf", "NotoSansDevanagari", "normal");
    doc.setFont("NotoSansDevanagari");
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
            <table id="t1" border="1" className="min-w-full bg-white border border-gray-400 shadow-md rounded-lg ">
            <thead>
                
              <tr className="bg-blue-600 text-white text-lg font-semibold border border-gray-400">
                <th className="py-4 px-6 border border-gray-400 text-left">ID</th>
                <th className="py-4 px-6 border border-gray-400 text-left">Category</th>
                <th className="py-4 px-6 border border-gray-400 text-right">Percentage</th>
                <th className="py-4 px-6 border border-gray-400 text-right">Allocated </th>
                <th className="py-4 px-6 border border-gray-400 text-right">Filled </th>
                <th className="py-4 px-6 border border-gray-400 text-right"><p>Remaining </p>
                exceeds  </th> {/* New Column */}
              </tr>
            </thead>
            <tbody>
              {distribution.map((cat, index) => (
                <tr
                  key={cat.id}
                  className={`${index % 2 === 0 ? "bg-gray-200" : "bg-white"} hover:bg-gray-300 border border-gray-400`}
                >
                  <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-left">{cat.id}</td>
                  <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-left">{cat.name}</td>
                  <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right">{cat.percentage}%</td>
                  <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right">{cat.allocatedSeats}</td>
                  <td
                    className={`py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right
                      ${cat.allocatedSeats === cat.filledSeats ? "bg-red-500 text-white" : ""}`}
                  >
                    {cat.filledSeats}
                  </td>
                  <td
                      style={{
                        padding: "2px",
                        border: "1px solid gray",
                        color: "black",
                        fontWeight: "500",
                        backgroundColor:
                          Number(cat.allocatedSeats) - Number(cat.filledSeats)< 0
                            ? "red"
                            : Number(cat.allocatedSeats) - Number(cat.filledSeats)=== 0  ? "green":"yellow",
                      }}      >
                    {cat.allocatedSeats - cat.filledSeats}
                  </td>
                </tr>
                
              ))}
                
            </tbody>
          </table>
          
            ) : (
              
              <table border="1"  id="t1" width="90%" align="center" className="w-full overflow-auto bg-white border border-gray-400 shadow-md rounded-lg ">
  <tbody>
    {/* ID Row */}
  
    <tr><th colspan="12">पदोन्नती / सरळसेवा भरतीसाठी बिंदू नामावली नोंदवही तपासणी गोषवारा (सरळसेवा)
दिनांक: ०१/०८/२०२४</th></tr>
<tr>
    <td colspan="6">सवर्गांची नाव शिक्षक  ( माध्यमिक आणि उच्च माध्यमिक )</td>
    <td colspan="6">एकूण मंजूर पदे</td>
</tr>
<tr>
    <td colspan="6">सरळसेवा टक्केवारी :- 100%</td>
    <td colspan="6">टक्केवारीनुसार सरळ सेवेसाठी उपलब्ध पदे</td>
</tr>
<tr><th colspan="12">पदोन्नती / सरळसेवा भरतीसाठी</th></tr>
<tr><th colspan="12">&nbsp;



     


      
  
  
  </th></tr>


    <tr className="bg-blue-600 text-white text-lg font-semibold border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">ID</th>
      {distribution.map((cat) => (
        <td key={`id-${cat.id}`} className="py-4 px-6 border border-gray-400">{cat.id}</td>
      ))}
    </tr>

    {/* Category Row */}
    <tr className="bg-gray-200 border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">तपशील </th>
      {distribution.map((cat) => (
        <td key={`name-${cat.id}`} className="py-4 px-6 border border-gray-400">{cat.name}</td>
      ))}
    </tr>

    {/* Allocated Seats Row */}
    <tr className="bg-white border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">मंजूर पदे</th>
      {distribution.map((cat) => (
        <td key={`allocated-${cat.id}`} className="py-4 px-6 border border-gray-400">{cat.allocatedSeats}</td>
      ))}
    </tr>

    {/* Filled Seats Row */}
    <tr className="bg-gray-200 border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">भरलेली पदे</th>
      {distribution.map((cat) => (
        <td
          key={`filled-${cat.id}`}
          className={`py-4 px-6 border border-gray-400 ${
            cat.allocatedSeats === cat.filledSeats ? "bg-red-500 text-white" : ""
          }`}
        >
          {cat.filledSeats}
        </td>
      ))}
    </tr>

    {/* Remaining Seats Row */}
    <tr className="bg-white border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">रिक्त पदे</th>
      {distribution.map((cat) => {
        const remainingSeats = - cat.filledSeats + cat.allocatedSeats ;
        total_Remaining_Seats = distribution.reduce(
          (total, { allocatedSeats, filledSeats }) => total + (allocatedSeats - filledSeats),
          0
        );
        return (
          <td
          style={{
            padding: "2px",
            border: "1px solid gray",
           // color: "black",
            fontWeight: "500",
            color:
              Number(cat.allocatedSeats) - Number(cat.filledSeats)< 0
                ? "red"
                : Number(cat.allocatedSeats) - Number(cat.filledSeats)=== 0  ? "green":"blue",
          }} 
          >
            {remainingSeats} 
                    </td>
        );
      })}
    </tr>
    <tr>
    <td>समायोजनाकरिता  पदे</td>
    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    <td></td><td></td> <td></td>
    </tr>
    <tr>
    <td>समायोजनानंतर भरावयाची पदे</td>
    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    <td></td><td></td> <td></td>
    </tr>
    <tr>
    <td>कालावधीत भरावयाची संभाव्य रिक्त पदे</td>
    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    <td></td><td></td> <td></td>
    </tr>
    {/* Remaining Seats Row */}
<tr className="bg-white border border-gray-400">
  <th className="py-4 px-6 border border-gray-400">एकूण भरावयाची पदे</th>
  {distribution.map((cat) => {
    const remainingSeats = cat.allocatedSeats - cat.filledSeats;
    return (
      <td
        style={{
          padding: "2px",
          border: "1px solid gray",
          color: "black",
          fontWeight: "500",
          backgroundColor:
            remainingSeats < 0
              ? "white"
              : remainingSeats === 0
              ? "white"
              : "white",
        }}
      >
        {Math.max(remainingSeats, 0)} {/* Ensures only positive or zero */}
      </td>
    );
  })}
</tr>

    <tr>
<td colspan="12">भरती वर्ष १</td>
</tr>
<tr>
<td colspan="12">
  <p> (दिनांक 26.08.2023 ते 23.08.2024)</p>
  </td>
  </tr>
 
 

        {categoryPosts.map((cat, index) => (
          <React.Fragment key={cat.name}>
            {/* Category Header Row */}
            <tr className="bg-gray-200 border border-gray-400">
              <td colSpan="12" style={{ fontWeight: "bold", padding: "10px", backgroundColor: "#f2f2f2" }}>
                {cat.name} आरक्षण गणना पत्रक
              </td>
            </tr>

            {/* Table Headers */}
            <tr colSpan="12" style={{ fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
              <td colSpan="4">पहिल्या वर्षात भरावयाची एकूण पदे</td>
              <td colSpan="4">एकूण भरावयाच्या पदच्या {cat.per}% नुसार येणारी पदे</td>
              <td colSpan="4">या भरती वर्षात {cat.name} प्रवर्गासाठी उपलब्ध पदे</td>
            </tr>

            {/* Data Row */}
            <tr >
              <td colSpan="4">{total_Remaining_Seats = total_Remaining_Seats < 0 ? 0 : total_Remaining_Seats}</td>  {/* Keep empty or add dynamic data */}
              <td colSpan="4">{(cat.per*total_Remaining_Seats)/100} </td>
              <td colSpan="4">{Math.round(cat.per * (total_Remaining_Seats / 100))}</td>  {/* Keep empty or add dynamic data */}
            </tr>

            {/* Space Row for Separation */}
            <tr><td colSpan="12" style={{ height: "10px" }}></td></tr>
          </React.Fragment>
        ))}
 


<tr className="bg-gray-200 border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">तपशील </th>
      {distribution.map((cat) => (
        <td key={`name-${cat.id}`} className="py-4 px-6 border border-gray-400">{cat.name}</td>
      ))}
    </tr>
    {/* Remaining Seats Row */}
<tr className="bg-white border border-gray-400">
  <th className="py-4 px-6 border border-gray-400">एकूण भरावयाची पदे</th>
  {distribution.map((cat) => {
    const remainingSeats = cat.allocatedSeats - cat.filledSeats;
    return (
      <td
        style={{
          padding: "2px",
          border: "1px solid gray",
          color: "black",
          fontWeight: "500",
          backgroundColor:
            remainingSeats < 0
              ? "white"
              : remainingSeats === 0
              ? "white"
              : "white",
        }}
      >
        {Math.max(remainingSeats, 0)} {/* Ensures only positive or zero */}
      </td>
    );
  })}
</tr>

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