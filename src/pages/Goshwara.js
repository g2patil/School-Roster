
import React, { useEffect, useState } from "react";
import config from "../config";
import jsPDF from "jspdf";
import "jspdf-autotable";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "../fonts/NotoFonts"; // adjust based on where your font is

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
          percentage: item.per        // category percentage
        }));
        setCategories(transformed);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  },[selectedDate]/*[categories, setCategories]*/);


  
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
        } else {
          // No data case
          setCategoryPosts([]);  // CLEAR the data
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        setCategoryPosts([]);  // CLEAR on error too
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
 
  const generatePDF1 = () => {
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

   const generatePDF2 = () => {
      const tableData = [];
      const tableHeaders = [
        'सवर्गांची नाव शिक्षक  ( माध्यमिक आणि उच्च माध्यमिक ) ', 
        'एकूण मंजूर पदे'
      ];
    
      const docDefinition = {
        content: [
          { text: 'पदोन्नती / सरळसेवा भरतीसाठी बिंदू नामावली नोंदवही तपासणी गोषवारा (सरळसेवा) दिनांक: ०१/०८/२०२४', style: 'header' },
          { text: 'सवर्गांची नाव शिक्षक  ( माध्यमिक आणि उच्च माध्यमिक )   एकूण मंजूर पदे', style: 'header' },
          { text: 'सरळसेवा टक्केवारी :- 100%     टक्केवारीनुसार सरळ सेवेसाठी उपलब्ध पदे', style: 'header' },
          { text: `पदोन्नती / सरळसेवा भरतीसाठी`, style: 'subheader'},
          { text: `दिनांक :- ${selectedDate}`, style: 'subheader' },
          {
            table: {
              headerRows: 1,
              widths: [30, 70, 30, 300, 30, 30],
              body: [
                tableHeaders,
                ...tableData
              ]
            },
            layout: {
           //   hLineColor: 'black', // Horizontal line color
          //    vLineColor: 'black', // Vertical line color
            //  hLineWidth: 1, // Horizontal line width
            //  vLineWidth: 1, // Vertical line width
           //   paddingLeft: 4, // Left padding for cells
           //   paddingRight: 4, // Right padding for cells
           //   paddingTop: 4, // Top padding for cells
           //   paddingBottom: 4, // Bottom padding for cells
           //   fillColor: '#f0f0f0', // Background color for header rows
              defaultBorder: true, // Ensures all cells have borders
            }
          }
        ],
        styles: {
          header: {
            fontSize: 12,
            bold: true,
            alignment: 'center'
          },
          subheader: {
            fontSize: 10,
            italics: true,
            alignment: 'center',
            margin: [0, 5]
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            color: 'black',
            alignment: 'center',
            fillColor: '#d3d3d3'
          },
          tableBody: {
            fontSize: 8,
            alignment: 'center',
            border: 1,
          }
        },
        defaultStyle: {
          font: 'NotoSansDevanagari'
        }
      };
  
      pdfMake.createPdf(docDefinition).download('goshwara_report.pdf');
    };
  
    const generatePDF = () => {
      const table = document.getElementById("t1");
    
      if (!table) {
        console.error("Table not found!");
        return;
      }
    
      // Extract headers
      const headerCells = [...table.querySelectorAll("thead tr th")];
      const headers = headerCells.map(th => ({
        text: th.innerText.trim(),
        style: 'tableHeader'
      }));
    
      // Total columns
      const columnCount = headers.length;
    
      if (columnCount === 0) {
        console.error("Table header has no columns.");
        return;
      }
    
      // Extract rows and ensure all rows have exactly the same number of columns
      const rows = [...table.querySelectorAll("tbody tr")].map(row => {
        const cells = [...row.querySelectorAll("td")];
        const paddedCells = cells.map(td => ({
          text: td.innerText.trim().toString(),
          style: 'tableBody'
        }));
    
        // Fill missing columns with empty cells
        while (paddedCells.length < columnCount) {
          paddedCells.push({ text: '', style: 'tableBody' });
        }
    
        return paddedCells.slice(0, columnCount); // Trim if too many
      });
    
      const selectedDate = '०१/०८/२०२४'; // replace with dynamic date if needed
    
      
      const docDefinition = {
        pageSize: 'A4',               // A4 Size
        pageOrientation: 'landscape',
        content: [
          { text: 'परिशिष्ट -3 ', style: 'header' },   
          { text: 'बिंदूनामावली नोंदवही तपासणी गोषवारा (सरलसेवा) ', style: 'header' }, 
         //  { text: 'पदोन्नती / सरळसेवा भरतीसाठी बिंदू नामावली नोंदवही तपासणी गोषवारा (सरळसेवा) दिनांक: ०१/०८/२०२४', style: 'header' },
          { text: 'सवर्गांची नाव शिक्षक  ( माध्यमिक आणि उच्च माध्यमिक )   एकूण मंजूर पदे', style: 'header' },
          { text: 'सरळसेवा टक्केवारी :- 100%     टक्केवारीनुसार सरळ सेवेसाठी उपलब्ध पदे', style: 'header' },
          { text: `प्रवर्ग निहाय आरक्षित बिंदू`, style: 'subheader' },
       //   { text: `पदोन्नती / सरळसेवा भरतीसाठी`, style: 'subheader' },
          { text: `दिनांक :- ${selectedDate}`, style: 'subheader' },
          {
            table: {
              headerRows: 1,
              headerRows: 1,
        widths: Array(columnCount).fill('auto'),  // prevents overflow
       // body: [headers, ...rows]
             // widths: Array(columnCount).fill('*'),
              body: [headers, ...rows]
            },
            layout: {
              defaultBorder: true
            }
          }
        ],
        styles: {
          header: {
            fontSize: 12,
            bold: true,
            alignment: 'center'
          },
          subheader: {
            fontSize: 10,
            italics: true,
            alignment: 'center',
            margin: [0, 2]
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            color: 'black',
            alignment: 'center',
            fillColor: '#d3d3d3'
          },
          tableBody: {
            fontSize: 10,
            alignment: 'center'
          }
        },
        defaultStyle: {
          font: 'NotoSansDevanagari'
        }
      };
    
      pdfMake.createPdf(docDefinition).download('goshwara_report.pdf');
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
              
              <table border="1"  id="t1" width="90%" align="center" className="w-full overflow-auto bg-white border border-gray-400 shadow-md rounded-lg ">
  <thead>
  <tr className="bg-blue-600 text-white text-lg font-semibold border border-gray-400">
    <th className="py-4 px-6 border border-gray-400"></th>
    {distribution.map((cat) => (
      <th key={`header-""${cat.id}""`} className="py-4 px-6 border border-gray-400"></th>
    ))}
  </tr>
</thead>
  
  <tbody>
    {/* ID Row */}
  
    <tr>
      <table><tr> <td align="center">पदोन्नती / सरळसेवा भरतीसाठी बिंदू नामावली नोंदवही तपासणी गोषवारा (सरळसेवा)
      दिनांक: ०१/०८/२०२४</td></tr></table>
     
</tr>

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
   
    <tr className="bg-gray-200 border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">समायोजनाकरिता  पदे </th>
      {distribution.map((cat) => (
        <td
          key={`filled-${cat.id}`}
          className={`py-4 px-6 border border-gray-400 ${
            cat.allocatedSeats === cat.filledSeats ? "bg-red-500 text-white" : ""
          }`}
        >
        </td>
      ))}
    </tr>

    <tr className="bg-gray-200 border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">समायोजनानंतर भरावयाची पदे </th>
      {distribution.map((cat) => (
        <td
          key={`filled-${cat.id}`}
          className={`py-4 px-6 border border-gray-400 ${
            cat.allocatedSeats === cat.filledSeats ? "bg-red-500 text-white" : ""
          }`}
        >
        </td>
      ))}
    </tr>

    <tr className="bg-gray-200 border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">कालावधीत भरावयाची संभाव्य रिक्त पदे</th>
      {distribution.map((cat) => (
        <td
          key={`filled-${cat.id}`}
          className={`py-4 px-6 border border-gray-400 ${
            cat.allocatedSeats === cat.filledSeats ? "bg-red-500 text-white" : ""
          }`}
        >
        </td>
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

    <tr>
<td colspan="12">भरती वर्ष १</td>
</tr>
<tr>
<td colspan="12">
  <p> (दिनांक 26.08.2023 ते 23.08.2024)</p>
  </td>
  </tr>
 
 

        { categoryPosts.length > 0 &&  categoryPosts.map((cat, index) => (
          <React.Fragment key={cat.name}>
            {/* Category Header Row */}
            <tr className="bg-gray-200 border border-gray-400">
              <td colSpan="12" style={{ fontWeight: "bold", padding: "10px", backgroundColor: "#f2f2f2" }}>
                {cat.name} आरक्षण गणना पत्रक
              </td>
            </tr>

            {/* Table Headers */}
            <tr  style={{ fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
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


            ) : (
              <div className="overflow-x-auto">
              <table border="1"  id="t1" width="90%" align="center" className="w-full overflow-auto bg-white border border-gray-400 shadow-md rounded-lg ">
  <thead  style={{ display: 'none' }}>
  <tr   className="bg-blue-600 text-white text-lg font-semibold border border-gray-400">
    <th className="py-4 px-6 border border-gray-400"></th>
    {distribution.map((cat) => (
      <th key={`header-""${cat.id}""`} className="py-4 px-6 border border-gray-400"></th>
    ))}
  </tr>
</thead>
  
  <tbody>
    {/* ID Row */}
  
   

    {/* Category Row */}
    <tr className="bg-gray-200 border border-gray-400">
      <td className="py-4 px-6 border border-gray-400">तपशील </td>
      {distribution.map((cat) => (
        <td key={`name-${cat.id}`} className="py-4 px-6 border border-gray-400">{cat.name}</td>
      ))}
    </tr>

    {/* Allocated Seats Row */}
    <tr className="bg-white border border-gray-400">
      <td className="py-4 px-6 border border-gray-400">मंजूर पदे</td>
      {distribution.map((cat) => (
        <td key={`allocated-${cat.id}`} className="py-4 px-6 border border-gray-400">{cat.allocatedSeats}</td>
      ))}
    </tr>

    {/* Filled Seats Row */}
    <tr className="bg-gray-200 border border-gray-400">
      <td className="py-4 px-6 border border-gray-400">भरलेली पदे</td>
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
      <td className="py-4 px-6 border border-gray-400">रिक्त पदे</td>
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
   
    <tr className="bg-gray-200 border border-gray-400">
      <td className="py-4 px-6 border border-gray-400">समायोजनाकरिता  पदे </td>
      {distribution.map((cat) => (
        <td
          key={`filled-${cat.id}`}
          className={`py-4 px-6 border border-gray-400 ${
            cat.allocatedSeats === cat.filledSeats ? "bg-red-500 text-white" : ""
          }`}
        >
        </td>
      ))}
    </tr>

    <tr className="bg-gray-200 border border-gray-400">
      <td className="py-4 px-6 border border-gray-400">समायोजनानंतर भरावयाची पदे </td>
      {distribution.map((cat) => (
        <td
          key={`filled-${cat.id}`}
          className={`py-4 px-6 border border-gray-400 ${
            cat.allocatedSeats === cat.filledSeats ? "bg-red-500 text-white" : ""
          }`}
        >
        </td>
      ))}
    </tr>

    <tr className="bg-gray-200 border border-gray-400">
      <td className="py-4 px-6 border border-gray-400">कालावधीत भरावयाची संभाव्य रिक्त पदे</td>
      {distribution.map((cat) => (
        <td
          key={`filled-${cat.id}`}
          className={`py-4 px-6 border border-gray-400 ${
            cat.allocatedSeats === cat.filledSeats ? "bg-red-500 text-white" : ""
          }`}
        >
        </td>
      ))}
    </tr> 


    {/* Remaining Seats Row */}
<tr className="bg-white border border-gray-400">
  <td className="py-4 px-6 border border-gray-400">एकूण भरावयाची पदे</td>
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
 
 

        { categoryPosts.length > 0 &&  categoryPosts.map((cat, index) => (
          <React.Fragment key={cat.name}>
            {/* Category Header Row */}
            <tr className="bg-gray-200 border border-gray-400">
              <td colSpan="12" style={{ fontWeight: "bold", padding: "10px", backgroundColor: "#f2f2f2" }}>
                {cat.name} आरक्षण गणना पत्रक
              </td>
            </tr>

            {/* Table Headers */}
            <tr  style={{ fontWeight: "bold", backgroundColor: "#e6e6e6" }}>
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
      <td className="py-4 px-6 border border-gray-400">तपशील </td>
      {distribution.map((cat) => (
        <td key={`name-${cat.id}`} className="py-4 px-6 border border-gray-400">{cat.name}</td>
      ))}
    </tr>
    {/* Remaining Seats Row */}
<tr className="bg-white border border-gray-400">
  <td className="py-4 px-6 border border-gray-400">एकूण भरावयाची पदे</td>
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
</div>

            )}



          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Goshwara;