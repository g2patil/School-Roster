import React, { useState, useEffect } from "react";
import config from "../config";
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

const ReservationDistribution = () => {
  const [totalSeats, setTotalSeats] = useState(0);
  const [distribution, setDistribution] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    return today;
  });
  const [categories, setCategories] = useState([]);
//  const [isVisible, setIsVisible] = useState(false);
const { userInfo } = useAuth();

//const instituteId = userInfo?.institute?.id;


  useEffect(() => {
    fetch(`${config.API_URL}/EmployeeRoster/goshwara_by_cat?s=${userInfo.instituteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        const transformed = data.map(item => ({
          reservation_category: item.reservation_category,
          bindu_name_mar: item.bindu_name_mar,
          percentage: item.percentage,
          bindu_nos: item.bindu_nos,
          fill_nos: item.fill_nos
        }));
        setCategories(transformed);
      })
      .catch((error) => console.error("Error fetching API data:", error));
  }, [userInfo.instituteId]);

  const calculateDistribution = () => {
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

  const exportTableToPDF = () => {
    const tableData = [];
    const tableHeaders = [
      'प्रवर्ग क्रमांक', 
      'प्रवर्गाचे नाव', 
      'Per %', 
      'वापरलेले बिंदू', 
      'मंजूर पदे', 
      'कार्यरत पदे'
    ];

    // Collect table rows
    distribution.forEach(cat => {
      tableData.push([
        cat.reservation_category,
        cat.bindu_name_mar,
        `${cat.percentage}%`,
        cat.bindu_nos,
        '',
        cat.fill_nos
      ]);
    });

    const docDefinition = {
      content: [
        { text: 'परिशिष्ट -4 ', style: 'header' },
        { text: 'कार्यरत व वापरलेला बिंदूंचा तक्ता  ', style: 'header' },
        { text: 'लेखालिपिक संवर्गाचा बिंदुनिहाय प्रवर्गाचा गोषवारा   ', style: 'header' },
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
            type="number"
            value={totalSeats}
          //  style={{ visibility: isVisible ? "visible" : "hidden" }}
            onChange={(e) => setTotalSeats(Number(e.target.value))}
            placeholder="Enter total seats"
            className="border border-gray-400 p-3 rounded w-full mb-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-400 p-3 rounded w-full mb-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />



          <button
            onClick={calculateDistribution}
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 shadow-md transition duration-300 mb-4"
          >
            Calculate Distribution
          </button>

          <button
            onClick={exportTableToPDF}
            className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 shadow-md transition duration-300 mb-4"
          >
            Export Table to PDF
          </button>

          <p>&nbsp;</p>
          {distribution.length > 0 && (
            <div className="overflow-x-auto max-h-96">
              <table id="t1" width="88%" border="1">
                <thead>
                  <tr>
                    <td colspan="6">​परिशिष्ट -4 </td>
                  </tr>
                  <tr>
                    <td colspan="6">कार्यरत व वापरलेला बिंदूंचा तक्ता </td>
                  </tr>
                  <tr>
                    <td colspan="6">लेखालिपिक संवर्गाचा बिंदुनिहाय प्रवर्गाचा गोषवारा </td>
                  </tr>
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
                      className={`${index % 2 === 0 ? "bg-gray-200" : "bg-white"} hover:bg-bg-white border border-gray-400`}
                    >
                      <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-left">{cat.reservation_category}</td>
                      <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-left">{cat.bindu_name_mar}</td>
                      <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right">{cat.percentage}%</td>
                      <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-left">{cat.bindu_nos}</td>
                      <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right">{}</td>
                      <td className="py-4 px-6 border border-gray-400 text-gray-800 font-medium text-right">{cat.fill_nos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationDistribution;
