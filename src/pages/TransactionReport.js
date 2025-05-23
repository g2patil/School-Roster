import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import config from "../config";

const TransactionReport = () => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [accountTypeId, setAccountTypeId] = useState('');
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
      })
      .catch((error) => console.error('Error fetching account types:', error));
  }, []);

  const fetchTransactionReport = async () => {
    if (!fromDate || !toDate || !accountTypeId) {
      alert('Please select all fields.');
      return;
    }

    setLoading(true);

    try {
      const url = `${config.API_URL}/account/report?fromDate=${fromDate}&toDate=${toDate}&accountTypeId=${accountTypeId}`;
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
    doc.internal.pageSize.width = 210; // A4 page width
    doc.internal.pageSize.height = 297; // A4 page height
  
    const tableColumn = [
      'Date',
      'Particular',
      'Txn ID',
      'L/F',
      'Cash Amount',
      'Bank Amount'
    ];
  
    const tableRows = [];
    let totalCashAmount = 0;
    let totalBankAmount = 0;
    let startY = 30;  // Starting Y for the table
    let pageHeight = doc.internal.pageSize.height;
    let currentPageHeight = startY;  // Track the current height on the page
  
    transactions.forEach((txn, index) => {
      const txnData = [
        txn[0],                           // Date
        txn[1] + "\n  " + txn[2],  // Particular with line break
        txn[3],                            // Txn ID
        txn[5],                            // Description (L/F)
        txn[6].toFixed(2),                 // Cash Amount (right-aligned)
        txn[7].toFixed(2)                  // Bank Amount (right-aligned)
      ];
  
      tableRows.push(txnData);
  
      // Accumulate totals for Cash and Bank Amounts
      totalCashAmount += txn[6];
      totalBankAmount += txn[7];
  
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
          },
          headStyles: {
            fillColor: [22, 160, 133],  // Green header color
            textColor: 255,             // White text color
            fontSize: 8,
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240], // Light grey for alternate rows
          },
          columnStyles: {
            4: { halign: 'right' },      // Right-align Cash Amount column
            5: { halign: 'right' },      // Right-align Bank Amount column
          }
        });
  
        // Add footer with totals for the current page
        const footerData = [
          '',                            // Empty for Date column
          'Total',                        // "Total" for Particular column
          '',                            // Empty for Txn ID column
          '',                            // Empty for L/F column
          totalCashAmount.toFixed(2),    // Cash Amount Total
          totalBankAmount.toFixed(2)     // Bank Amount Total
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
          },
          columnStyles: {
            4: { halign: 'right' },      // Right-align Cash Amount column in footer
            5: { halign: 'right' },      // Right-align Bank Amount column in footer
          },
          margin: { left: 14 },          // Set left margin to match the table
        });
  
        // Reset totals and prepare for the next page
        totalCashAmount = 0;
        totalBankAmount = 0;
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
        },
        headStyles: {
          fillColor: [22, 160, 133],  // Green header color
          textColor: 255,             // White text color
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240], // Light grey for alternate rows
        },
        columnStyles: {
          4: { halign: 'right' },      // Right-align Cash Amount column
          5: { halign: 'right' },      // Right-align Bank Amount column
        }
      });
  
      // Add footer with totals for the last page
      const footerData = [
        '',                            // Empty for Date column
        'Total',                        // "Total" for Particular column
        '',                            // Empty for Txn ID column
        '',                            // Empty for L/F column
        totalCashAmount.toFixed(2),    // Cash Amount Total
        totalBankAmount.toFixed(2)     // Bank Amount Total
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
          halign: 'right',             // Right-align Cash Amount and Bank Amount
        },
        columnStyles: {
          4: { halign: 'right' },      // Right-align Cash Amount column in footer
          5: { halign: 'right' },      // Right-align Bank Amount column in footer
        },
        margin: { left: 14 },          // Set left margin to match the table
      });
    }
  
    // Save the PDF file
    doc.save('TransactionReport.pdf');
  };
  
/*
  const exportToPDF = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }
  
    const doc = new jsPDF();
  
    // Set page dimensions
    doc.internal.pageSize.width = 210; // A4 page width
    doc.internal.pageSize.height = 297; // A4 page height
  
    const tableColumn = [
      'Date',
      'Particular',
      'Txn ID',
      'L/F',
      'Cash Amount',
      'Bank Amount'
    ];
  
    const tableRows = [];
    let totalCashAmount = 0;
    let totalBankAmount = 0;
    let startY = 30;  // Starting Y for the table
    let pageHeight = doc.internal.pageSize.height;
    let currentPageHeight = startY;  // Track the current height on the page
  
    transactions.forEach((txn, index) => {
      const txnData = [
        txn[0],                           // Date
        txn[1] + "\n  " + txn[2],  // Particular with line break
        txn[3],                            // Txn ID
        txn[5],                            // Description (L/F)
        txn[6].toFixed(2),                 // Cash Amount (right-aligned)
        txn[7].toFixed(2)                  // Bank Amount (right-aligned)
      ];
  
      tableRows.push(txnData);
  
      // Accumulate totals for Cash and Bank Amounts
      totalCashAmount += txn[6];
      totalBankAmount += txn[7];
  
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
          },
          headStyles: {
            fillColor: [22, 160, 133],  // Green header color
            textColor: 255,             // White text color
            fontSize: 8,
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240], // Light grey for alternate rows
          },
          columnStyles: {
            4: { halign: 'right' },      // Right-align Cash Amount column
            5: { halign: 'right' },      // Right-align Bank Amount column
          }
        });
  
        // Add footer with totals for the current page
        const footerData = [
          '',                            // Empty for Date column
          'Total',                        // "Total" for Particular column
          '',                            // Empty for Txn ID column
          '',                            // Empty for L/F column
          totalCashAmount.toFixed(2),    // Cash Amount Total
          totalBankAmount.toFixed(2)     // Bank Amount Total
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
          },
          columnStyles: {
            4: { halign: 'right' },      // Right-align Cash Amount column in footer
            5: { halign: 'right' },      // Right-align Bank Amount column in footer
          },
          margin: { left: 14 },          // Set left margin to match the table
        });
  
        // Reset totals and prepare for the next page
        totalCashAmount = 0;
        totalBankAmount = 0;
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
        },
        headStyles: {
          fillColor: [22, 160, 133],  // Green header color
          textColor: 255,             // White text color
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240], // Light grey for alternate rows
        },
        columnStyles: {
          4: { halign: 'right' },      // Right-align Cash Amount column
          5: { halign: 'right' },      // Right-align Bank Amount column
        }
      });
  
      // Add footer with totals for the last page
      const footerData = [
        '',                            // Empty for Date column
        'Total',                        // "Total" for Particular column
        '',                            // Empty for Txn ID column
        '',                            // Empty for L/F column
        totalCashAmount.toFixed(2),    // Cash Amount Total
        totalBankAmount.toFixed(2)     // Bank Amount Total
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
          halign: 'right',             // Right-align Cash Amount and Bank Amount
        },
        columnStyles: {
          4: { halign: 'right' },      // Right-align Cash Amount column in footer
          5: { halign: 'right' },      // Right-align Bank Amount column in footer
        },
        margin: { left: 14 },          // Set left margin to match the table
      });
    }
  
    // Save the PDF file
    doc.save('TransactionReport.pdf');
  };
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
      'Cash Amount': txn[6],
      'Bank Amount': txn[7],
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
                    <td style={styles.rightAlign}>{txn[6].toFixed(2)}</td>
                    <td style={styles.rightAlign}>{txn[7].toFixed(2)}</td>
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
