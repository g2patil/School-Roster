import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import config from "../config";

const TransactionReport = () => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [accountTypes1, setAccountTypes1] = useState([]);
  const [accountTypeId, setAccountTypeId] = useState('');
  const [accountTypeId1, setAccountTypeId1] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${config.API_URL}/school/account/account-types`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((jsonData) => {
        console.log('Account Types:', jsonData);
        setAccountTypes(jsonData);
        setAccountTypes1(jsonData);
      })
      .catch((error) => console.error('Error fetching account types:', error));
  }, []);

  const fetchTransactionReport = async () => {
    if (!fromDate || !toDate || !accountTypeId || !accountTypeId1) {
      alert('Please select all fields.');
      return;
    }

    setLoading(true);

    try {
      const url = `${config.API_URL}/account/combine/report?fromDate=${fromDate}&toDate=${toDate}&accountTypeId=${accountTypeId}&accountTypeId1=${accountTypeId1}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      console.log('Transaction Data:', data);
      setTransactions(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching data.');
    } finally {
      setLoading(false);
    }
  };

 
  



  const exportToPDF = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }
  
    const doc = new jsPDF();
  
    // Set page dimensions
    doc.internal.pageSize.width = 297 ;//210; // A4 page width
    doc.internal.pageSize.height = 210;//297; // A4 page height
  
    const tableColumn = [
      'Date',
      'Voucher No.',
      'Particular',
      'Txn ID',
      'L/F',
      'Cash Amount',
      'Bank Amount',
      'Saving Bank Amount',
      'Date',
      'Voucher No.',
      'Particular',
      'Txn ID',
      'L/F',
      'Cash Amount',
      'Bank Amount',
      'Saving Bank Amount'
    ];
  
    const tableRows = [];
    let totalCashAmount = 0;
    let totalBankAmount = 0;
    let totalsavingBankAmount = 0;
    let totalCashAmount1 = 0;
    let totalBankAmount1 = 0;
    let totalsavingBankAmount1 = 0;
    let startY = 30;  // Starting Y for the table
    let pageHeight = doc.internal.pageSize.height;
    let currentPageHeight = startY;  // Track the current height on the page
  
    transactions.forEach((txn, index) => {
      const txnData = [
        txn[3],
        txn[1],                            // Date
        txn[4] + "\n  " + txn[8],  // Particular with line break
        txn[6],                            // Txn ID
        txn[2],                            // Description (L/F)
        txn[9]?.toFixed(2) || '0.00',                 // Cash Amount (right-aligned)
        txn[10]?.toFixed(2) || '0.00',                 // Cash Amount (right-aligned)
        txn[11]?.toFixed(2) || '0.00',
        txn[15],
        txn[13],                            // Date
        txn[16] + "\n  " + txn[20],  // Particular with line break
        txn[18],                            // Txn ID
        txn[14],                            // Description (L/F)
        txn[21]?.toFixed(2) || '0.00',                 // Cash Amount (right-aligned)
        txn[22]?.toFixed(2) || '0.00',                 // Cash Amount (right-aligned)
        txn[23]?.toFixed(2) || '0.00'                   // Bank Amount (right-aligned)
      ];
  
      tableRows.push(txnData);
  
      // Accumulate totals for Cash and Bank Amounts
    //  totalCashAmount += txn[9]?.toFixed(2) || 0;
   //   totalBankAmount += txn[10]?.toFixed(2) || 0;

   totalCashAmount += parseFloat(txn[9] || 0);
   totalBankAmount += parseFloat(txn[10] || 0);
   totalsavingBankAmount += parseFloat(txn[11] || 0);

   totalCashAmount1 += parseFloat(txn[21] || 0);
   totalBankAmount1 += parseFloat(txn[22] || 0);
   totalsavingBankAmount1 += parseFloat(txn[23] || 0);
  
      const tableHeight = 12; // Approximate height per row, adjust if necessary
  
      // Check if the table has reached the bottom of the page (to add a new page)
      if (currentPageHeight + tableRows.length * tableHeight > pageHeight - 40) {
        // Add the current page's table
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: currentPageHeight,
          styles: {
            fontSize: 6,
            cellPadding: 2, // Reduced padding for a tighter table
            border:2,
          },
          headStyles: {
            fillColor: [220, 0, 133],  // Green header color
            textColor: 0,             // White text color
            fontSize: 8,
          },
          alternateRowStyles: {
            fillColor: [240, 40, 240], // Light grey for alternate rows
          },
          columnStyles: {
            5: { halign: 'right' },      // Right-align Cash Amount column
            6: { halign: 'right' }, 
            7: { halign: 'right' },     // Right-align Bank Amount column
            13: { halign: 'right' },      // Right-align Cash Amount column
            14: { halign: 'right' }, 
            15: { halign: 'right' }, 
          }
        });
  
        // Add footer with totals for the current page
        const footerData = [
          'a', 
          'b',                           // Empty for Date column
          'Total',                        // "Total" for Particular column
          'd',                            // Empty for Txn ID column
          'e',                            // Empty for L/F column
          totalCashAmount,    // Cash Amount Total
          totalBankAmount,     // Bank Amount Total
          totalsavingBankAmount,
          'i', 
          'j',                           // Empty for Date column
          'Total',                        // "Total" for Particular column
          'l',                            // Empty for Txn ID column
          'm',                            // Empty for L/F column
          totalCashAmount1,    // Cash Amount Total
          totalBankAmount1,     // Bank Amount Total
          totalsavingBankAmount1
        ];
  
        let footerY = currentPageHeight + tableRows.length * tableHeight + 5;  // Footer position
  
        // If footer is going beyond the page height, adjust it
        if (footerY + 15 > pageHeight) {
          doc.addPage();
          footerY = 20;  // Reset footer position to the top of the new page
        }
  
        // Add footer for this page
        doc.autoTable({
          head: [],
          body: [footerData],
          startY: footerY,
          styles: {
            fontSize: 8,
            cellPadding: 2,
            halign: 'right',             // Right-align Cash Amount and Bank Amount
            border:2,
          },
          columnStyles: {
            5: { halign: 'right' },      // Right-align Cash Amount column
            6: { halign: 'right' }, 
            7: { halign: 'right' }, 
            13: { halign: 'right' },      // Right-align Cash Amount column
            14: { halign: 'right' }, 
            15: { halign: 'right' },       // Right-align Bank Amount column in footer
          },
          margin: { left: 14 },          // Set left margin to match the table
        });
  
        // Reset totals and prepare for the next page
        totalCashAmount = 0;
        totalBankAmount = 0;
        totalsavingBankAmount = 0;
        totalCashAmount1 = 0;
        totalBankAmount1 = 0;
        totalsavingBankAmount1 = 0;
        tableRows.length = 0;  // Clear the rows for the next page
        currentPageHeight = 30;  // Reset currentPageHeight for the new page
        doc.addPage();  // Add a new page
      }
    });
  
    // Add the last set of table rows (if any)
    if (tableRows.length > 0) {
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: currentPageHeight,
        styles: {
          fontSize: 6,
          cellPadding: 2, // Reduced padding for a tighter table
          border:2,
          lineColor: [0, 0, 0], 
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [220, 160, 133],  // Green header color
          textColor: 255,             // White text color
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240], // Light grey for alternate rows
        },
        columnStyles: {
          5: { halign: 'right' },      // Right-align Cash Amount column
          6: { halign: 'right' }, 
          7: { halign: 'right' },      // Right-align Cash Amount column
          13: { halign: 'right' },      // Right-align Cash Amount column
          14: { halign: 'right' }, 
          15: { halign: 'right' },    // Right-align Bank Amount column
        }
      });
  
      // Add footer with totals for the last page
      const footerData = [
        'A',  
        'B',                          // Empty for Date column
        'Total',                        // "Total" for Particular column
        'D',                            // Empty for Txn ID column
        'E', 
                                // Empty for L/F column
        totalCashAmount,    // Cash Amount Total
        totalBankAmount,     // Bank Amount Total
        totalsavingBankAmount,
        'I',  
        'J', 
                               // Empty for Date column
        'Total',                        // "Total" for Particular column
        'L',                            // Empty for Txn ID column
        'M',                            // Empty for L/F column
        totalCashAmount1,    // Cash Amount Total
        totalBankAmount1,     // Bank Amount Total
        totalsavingBankAmount1
      ];
  
      let footerY = currentPageHeight + tableRows.length * 12 + 5;  // Footer position
  
      // If footer is going beyond the page height, adjust it
      if (footerY + 15 > pageHeight) {
        doc.addPage();
        footerY = 20;  // Reset footer position to the top of the new page
      }
  
      // Add footer for the last page
      doc.autoTable({
        head: [],
        body: [footerData],
        startY: footerY,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          cellspacing: 2,
          border:2,
          lineColor: [0, 0, 0], 
          lineWidth: 0.5,
          halign: 'right',             // Right-align Cash Amount and Bank Amount
        },
        columnStyles: {
            5: { halign: 'right' },      // Right-align Cash Amount column
            6: { halign: 'right' }, 
            7: { halign: 'right' }, 
            13: { halign: 'right' },      // Right-align Cash Amount column
            14: { halign: 'right' }, 
            15: { halign: 'right' },      // Right-align Bank Amount column in footer
        },
        margin: { left: 14 },          // Set left margin to match the table
      });
    }
  
    // Save the PDF file
    doc.save('TransactionReport.pdf');
  };
  
/*
 
  */


  const exportToExcel = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const worksheetData = transactions.map((txn) => ({
      'Transaction Date': txn[0],
      'Account Main Head': txn[1],
      'Account Sub Head': txn[2],
      'Transaction ID': txn[3],
      'Cash/Bank': txn[4],
      'Description': txn[5],
      'Cash Amount': txn[9]?.toFixed(2) || '0.00',
      'Bank Amount': txn[10]?.toFixed(2) || '0.00',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Instead of file-saver, manually trigger download
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'TransactionReport.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="form-container">
      <div style={styles.container}>
        <h2 style={styles.header}>Transaction Report</h2>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Account Type</label>
          <select
            name="accountTypeId"
            value={accountTypeId}
            onChange={(e) => setAccountTypeId(e.target.value)}
            style={styles.select}
          >
            <option value="">Select</option>
            {accountTypes.map((type) => (
              <option key={type.accountTypeId} value={type.accountTypeId}>
                {type.accountType}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Account Type1</label>
          <select
            name="accountTypeId1"
            value={accountTypeId1}
            onChange={(e) => setAccountTypeId1(e.target.value)}
            style={styles.select}
          >
            <option value="">Select</option>
            {accountTypes1.map((type) => (
              <option key={type.accountTypeId} value={type.accountTypeId}>
                {type.accountType}
              </option>
            ))}
          </select>
        </div>








        <div style={styles.inputGroup}>
          <label style={styles.label}>From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={styles.input}
          />
        </div>

        <button
          onClick={fetchTransactionReport}
          disabled={loading}
          style={loading ? styles.buttonLoading : styles.button}
        >
          {loading ? 'Loading...' : 'Fetch Report'}
        </button>

        <button
          onClick={exportToExcel}
          style={{ ...styles.button, marginTop: '10px', backgroundColor: '#28a745' }}
        >
          Export to Excel
        </button>

        <button
  onClick={exportToPDF}
  style={{ ...styles.button, marginTop: '10px', backgroundColor: '#dc3545' }}
>
  Export to PDF
</button>

        <div style={styles.tableContainer}>
          {transactions.length > 0 ? (
            <table style={styles.table} border="1" cellPadding="10" cellSpacing="0">
              <thead>
                <tr>
                  <th>Transaction Date</th>
                  <th>Account Main Head</th>
                  <th>Account Sub Head</th>
                  <th>Transaction ID</th>
                  <th>Cash/Bank</th>
                  <th>Description</th>
                  <th style={styles.rightAlign}>Cash Amount</th>
                  <th style={styles.rightAlign}>Bank Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, index) => (
                  <tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td>{txn[0]}</td>
                    <td>{txn[1]}</td>
                    <td>{txn[2]}</td>
                    <td>{txn[3]}</td>
                    <td>{txn[4]}</td>
                    <td>{txn[5]}</td>
                    <td style={styles.rightAlign}>{txn[9].toFixed(2)}</td>
                    <td style={styles.rightAlign}>{txn[10].toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    fontSize: '24px',
    marginBottom: '20px',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '6px',
    fontWeight: '500',
    fontSize: '16px',
    color: '#555',
  },
  select: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%',
    transition: 'background-color 0.3s ease',
  },
  buttonLoading: {
    backgroundColor: '#6c757d',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontSize: '16px',
    width: '100%',
  },
  tableContainer: {
    marginTop: '30px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #ddd',
  },
  rightAlign: {
    textAlign: 'right',
    paddingRight: '15px',
    paddingLeft: '10px',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
};

export default TransactionReport;
