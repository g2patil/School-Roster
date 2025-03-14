
import React, { useEffect, useState } from "react";
import config from "../config";
const ReservationDistribution = () => {
  const [totalSeats, setTotalSeats] = useState(0);
  const [distribution, setDistribution] = useState([]);
  const [apiData, setApiData] = useState({});
  const [isVertical, setIsVertical] = useState(true);

  const categories = [
    { id: 1, name: "Scheduled Castes (SC)", percentage: 13 },
    { id: 2, name: "Scheduled Tribes (ST)", percentage: 7 },
    { id: 3, name: "Nomadic Tribes - NT-A (VJ/DT)", percentage: 3 },
    { id: 4, name: "Nomadic Tribes - NT-B", percentage: 2.5 },
    { id: 5, name: "Nomadic Tribes - NT-C (Dhangar)", percentage: 3.5 },
    { id: 6, name: "Nomadic Tribes - NT-D", percentage: 2 },
    { id: 7, name: "Special Backward Class (SBC)", percentage: 2 },
    { id: 8, name: "Other Backward Classes (OBC)", percentage: 19 },
    { id: 9, name: "Maratha (under SEBC)", percentage: 10 },
    { id: 10, name: "Economically Weaker Section (EWS)", percentage: 10 },
    { id: 11, name: "Open (General Category)", percentage: 28 },
  ];

  useEffect(() => {
    fetch(`${config.API_URL}/EmployeeRoster/summary/1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies (like SESSION ID)
    })
      .then((response) => response.text()) // Get raw response as text
      .then((text) => {
        console.log("Raw API Response:", text); // Log the response before parsing
        try {
          const jsonData = JSON.parse(text); // Try parsing as JSON
          console.log("Parsed JSON:", jsonData);
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            setApiData(jsonData[0]); // Set state if JSON is valid
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      })
      .catch((error) => console.error("Error fetching API data:", error));
  }, []);
  

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

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-4xl text-center border border-gray-300">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-blue-500 pb-2">
          Reservation Category Distribution
        </h2>

        <input
          type="number"
          value={totalSeats}
          onChange={(e) => setTotalSeats(Number(e.target.value))}
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

        {distribution.length > 0 && (
          <div className="overflow-x-auto mt-6">
            {isVertical ? (
            <table border="1" className="min-w-full bg-white border border-gray-400 shadow-md rounded-lg overflow-hidden">
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
              <table border="1" className="w-full overflow-auto bg-white border border-gray-400 shadow-md rounded-lg overflow-hidden">
  <tbody>
    {/* ID Row */}
    <tr className="bg-blue-600 text-white text-lg font-semibold border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">ID</th>
      {distribution.map((cat) => (
        <td key={`id-${cat.id}`} className="py-4 px-6 border border-gray-400">{cat.id}</td>
      ))}
    </tr>

    {/* Category Row */}
    <tr className="bg-gray-200 border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">Category</th>
      {distribution.map((cat) => (
        <td key={`name-${cat.id}`} className="py-4 px-6 border border-gray-400">{cat.name}</td>
      ))}
    </tr>

    {/* Allocated Seats Row */}
    <tr className="bg-white border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">Allocated Seats</th>
      {distribution.map((cat) => (
        <td key={`allocated-${cat.id}`} className="py-4 px-6 border border-gray-400">{cat.allocatedSeats}</td>
      ))}
    </tr>

    {/* Filled Seats Row */}
    <tr className="bg-gray-200 border border-gray-400">
      <th className="py-4 px-6 border border-gray-400">Filled Seats</th>
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
      <th className="py-4 px-6 border border-gray-400">Remaining /exceeds allocated   Seats</th>
      {distribution.map((cat) => {
        const remainingSeats = - cat.filledSeats + cat.allocatedSeats ;
        return (
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
          }} 
          >
            {remainingSeats}
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
  );
};

export default ReservationDistribution;
