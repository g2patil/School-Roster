
import React, {  useEffect, useState } from "react";
import config from "../config";
import jsPDF from "jspdf";
import "jspdf-autotable";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "../fonts/NotoFonts"; // adjust based on where your font is
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
  const { userInfo } = useAuth();
  const [totalSeats, setTotalSeats] = useState(0);
  const [resvSeats, setResvSeats] = useState(0);
  const [distribution, setDistribution] = useState([]);
  const [apiData, setApiData] = useState({});
  const [isVertical, setIsVertical] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryPosts, setCategoryPosts] = useState([]);
  const [totOccupiedSeat, setTotOccupiedSeat] = useState(0);
  const [totalRemainingSeats, setTotalRemainingSeats] = useState(0);


  let tot_occupied_seat=0;
  let total_Remaining_Seats=0;
 // const [selectedDate, setSelectedDate] = useState("");
const [selectedDate, setSelectedDate] = useState(() => {
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  return today;
});
//const [calculatedReservations, setCalculatedReservations] = useState([]);
 




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

  
  
   // if (!userInfo || !userInfo.instituteId) return; 

    fetch(`${config.API_URL}/EmployeeRoster/summary/${userInfo.instituteId}?s=${selectedDate}`, {
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
  }, [userInfo,selectedDate]); 
  
  const handleSeatsChange = (e) => {
    const value = Number(e.target.value);
    setTotalSeats(value);
    setResvSeats(value);
    //tot_occupied_seat=tot_occupied_seat+filledSeats;
    total_Remaining_Seats = distribution.reduce(
    (total, { allocatedSeats, filledSeats }) => total + (allocatedSeats - filledSeats),
    0
  );
  };

  

  const calculateDistribution = () => {
    let allocatedSeats = 0;
    let totalFilled = 0;
  
    const calculated = categories.map((category) => {
      const seats = Math.round((category.percentage / 100) * totalSeats);
      allocatedSeats += seats;
  
      const filled = apiData[category.id] ? parseInt(apiData[category.id], 10) : 0;
      totalFilled += filled;
  
      return {
        id: category.id,
        name: category.name,
        percentage: category.percentage,
        allocatedSeats: seats,
        filledSeats: filled,
      };
    });
  
    // Adjust for rounding errors in open category (ID 11)
    const openCategory = calculated.find((cat) => cat.id === 11);
    if (openCategory) {
      openCategory.allocatedSeats += totalSeats - allocatedSeats;
    }
  
    // Set updated data
    setDistribution(calculated);
    setTotOccupiedSeat(totalFilled);  // <== Set to state
    setTotalRemainingSeats(totalSeats - totalFilled); // <== Set to state
  };
  


  /************ */
 
  
    

    const generatePDF = () => {
      const table = document.getElementById("t1");
      if (!table) return;
    
      const rows = [...table.querySelectorAll("thead tr, tbody tr")];
      const tableMatrix = [];
      let maxCols = 0;
    
      rows.forEach((row, rowIndex) => {
        const cells = [...row.children];
        let colIndex = 0;
    
        // Initialize current row if not present
        if (!tableMatrix[rowIndex]) tableMatrix[rowIndex] = [];
    
        cells.forEach((cell) => {
          // Skip filled columns (from rowSpan/colSpan)
          while (tableMatrix[rowIndex][colIndex]) colIndex++;
    
          const rowspan = parseInt(cell.getAttribute("rowspan") || "1", 10);
          const colSpan = parseInt(cell.getAttribute("colSpan") || "1", 10);
    
          const cellObj = {
            text: cell.innerText.trim(),
            style: rowIndex === 0 ? "tableHeader" : "tableBody"
          };
    
          if (rowspan > 1) cellObj.rowSpan = rowspan;
          if (colSpan > 1) cellObj.colSpan = colSpan;
    
          // Place the real cell
          tableMatrix[rowIndex][colIndex] = cellObj;
    
          // Fill placeholder cells
          for (let rs = 0; rs < rowspan; rs++) {
            for (let cs = 0; cs < colSpan; cs++) {
              if (rs === 0 && cs === 0) continue;
              if (!tableMatrix[rowIndex + rs]) tableMatrix[rowIndex + rs] = [];
              tableMatrix[rowIndex + rs][colIndex + cs] = {};
            }
          }
    
          colIndex += colSpan;
        });
    
        maxCols = Math.max(maxCols, tableMatrix[rowIndex].length);
      });
    
      // Normalize rows to have same length
      tableMatrix.forEach((row) => {
        while (row.length < maxCols) row.push({});
      });
    
      const docDefinition = {
        pageSize: "A4",
      //  pageOrientation: "landscape",
        content: [
          { text: "परिशिष्ट -3", style: "header" },
          { text: "बिंदूनामावली नोंदवही तपासणी गोषवारा ( सरलसेवा ) :- "+`${selectedDate}`, style: "header" },
          { text: "सवर्गांची नाव शिक्षक (माध्यमिक आणि उच्च माध्यमिक)        एकूण मंजूर पदे :- "+`${totalSeats}`, style: "header" },
          { text: "सरळसेवा टक्केवारी :- 100%     टक्केवारीनुसार सरळ सेवेसाठी उपलब्ध पदे", style: "header" },
          { text: "प्रवर्ग निहाय आरक्षित बिंदू", style: "subheader" },
            { text: "मंजूर पदे :-"+`${totalSeats}`+
        "    भरलेली पदे :-"+`${totOccupiedSeat}`+
        "    रिक्त पदे :- "+`${totalRemainingSeats}`, style: "subheader" },

         {
            table: {
              headerRows: 1,
              widths: Array(maxCols).fill("auto"),
              body: tableMatrix
            },
            layout: "grid" //"lightHorizontalLines"
          }
        ],
        styles: {
          header: {
            fontSize: 12,
            bold: true,
            alignment: "center"
          },
          subheader: {
            fontSize: 8,
            italics: true,
            alignment: "center",
            margin: [0, 2]
          },
          tableHeader: {
            bold: true,
            fontSize: 8,
            color: "black",
            alignment: "center",
            fillColor: "#d3d3d3"
          },
          tableBody: {
            fontSize: 8,
            alignment: "center"
          }
        },
        defaultStyle: {
          font: "NotoSansDevanagari"
        }
      };
    
      pdfMake.createPdf(docDefinition).download("goshwara_report.pdf");
    };
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
              <div className="overflow-x-auto">
  <table border="1"  id="t0" width="90%" align="center" className="w-full overflow-auto bg-white border border-gray-400 shadow-md rounded-lg ">
  <thead>
  <tr className="bg-blue-600 text-white text-lg font-semibold border border-gray-400">
   
  
  </tr>
</thead>
  
  
    {/* ID Row */}
  
    <tr>
      <table><tr> <td align="center">पदोन्नती / सरळसेवा भरतीसाठी बिंदू नामावली नोंदवही तपासणी गोषवारा (सरळसेवा)
      दिनांक: ०१/०८/२०२४</td></tr></table>
     
</tr>

<tr>
    <td colSpan="6">सवर्गांची नाव शिक्षक  ( माध्यमिक आणि उच्च माध्यमिक )</td>
    <td colSpan="6">एकूण मंजूर पदे</td>
</tr>
<tr>
    <td colSpan="6">सरळसेवा टक्केवारी :- 100%</td>
    <td colSpan="6">टक्केवारीनुसार सरळ सेवेसाठी उपलब्ध पदे</td>
</tr>
<tr><th colSpan="12">पदोन्नती / सरळसेवा भरतीसाठी</th></tr>
<tr><th colSpan="12">&nbsp;

  </th></tr>
</table>
                
              <table border="1"  id="t1" width="90%" align="center" className="w-full overflow-auto bg-white border border-gray-400 shadow-md rounded-lg ">
  <thead  style={{ display: 'none' }}>

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

        { categoryPosts.length > 0 &&  categoryPosts.map((cat, index) => (
          <React.Fragment key={cat.name}>
            {/* Category Header Row */}

            <tr className="bg-gray-200 border border-gray-400">
              <td colSpan="12" style={{ fontWeight: "bold", padding: "10px", backgroundColor: "#f2f2f2" }}>
              भरती वर्ष 
              </td>
            </tr>

            <tr className="bg-gray-200 border border-gray-400">
              <td colSpan="12" style={{ fontWeight: "bold", padding: "10px", backgroundColor: "#f2f2f2" }}>
              (दिनांक DD.MM.YYYY ते DD.MM.YYYY)
              </td>
            </tr>
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
    
           <td COLSPAN="12" className="py-4 px-6 border border-gray-400">
          
           पहिल्या वर्षात करिता  { categoryPosts.length > 0 &&  categoryPosts.map((cat, index) => (
          <React.Fragment key={cat.name}>
            
           {cat.name}  व  </React.Fragment> 
          ))}पदे उपलब्ध होतील.
           </td>
          
   
    </tr>



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

            ) : (
              <div className="overflow-x-auto">
  <table border="1"  id="t0" width="90%" align="center" className="w-full overflow-auto bg-white border border-gray-400 shadow-md rounded-lg ">
  <thead>
  <tr className="bg-blue-600 text-white text-lg font-semibold border border-gray-400">
    <th className="py-4 px-6 border border-gray-400"></th>
    {distribution.map((cat) => (
      <th key={`header-""${cat.id}""`} className="py-4 px-6 border border-gray-400"></th>
    ))}
  </tr>
</thead>
  
  
    {/* ID Row */}
  
    <tr>
      <table><tr> <td align="center">पदोन्नती / सरळसेवा भरतीसाठी बिंदू नामावली नोंदवही तपासणी गोषवारा (सरळसेवा)
      दिनांक: ०१/०८/२०२४</td></tr></table>
     
</tr>

<tr>
    <td colSpan="6">सवर्गांची नाव शिक्षक  ( माध्यमिक आणि उच्च माध्यमिक )</td>
    <td colSpan="6">एकूण मंजूर पदे</td>
</tr>
<tr>
    <td colSpan="6">सरळसेवा टक्केवारी :- 100%</td>
    <td colSpan="6">टक्केवारीनुसार सरळ सेवेसाठी उपलब्ध पदे</td>
</tr>
<tr><th colSpan="12">पदोन्नती / सरळसेवा भरतीसाठी</th></tr>
<tr><th colSpan="12">&nbsp;

  </th></tr>
</table>
                
              <table border="1"  id="t1" width="90%" align="center" className="w-full overflow-auto bg-white border border-gray-400 shadow-md rounded-lg ">
  <thead  style={{ display: 'none' }}>

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


 
 

        { categoryPosts.length > 0 &&  categoryPosts.map((cat, index) => (
          <React.Fragment key={cat.name}>
            {/* Category Header Row */}

            <tr className="bg-gray-200 border border-gray-400">
              <td colSpan="12" style={{ fontWeight: "bold", padding: "10px", backgroundColor: "#f2f2f2" }}>
              भरती वर्ष 
              </td>
            </tr>

            <tr className="bg-gray-200 border border-gray-400">
              <td colSpan="12" style={{ fontWeight: "bold", padding: "10px", backgroundColor: "#f2f2f2" }}>
              (दिनांक DD.MM.YYYY ते DD.MM.YYYY)
              </td>
            </tr>



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
    
           <td COLSPAN="12" className="py-4 px-6 border border-gray-400">
          
           पहिल्या वर्षात करिता  { categoryPosts.length > 0 &&  categoryPosts.map((cat, index) => (
          <React.Fragment key={cat.name}>
            
           {cat.name}  व  </React.Fragment> 
          ))}पदे उपलब्ध होतील.
           </td>
          
   
    </tr>



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