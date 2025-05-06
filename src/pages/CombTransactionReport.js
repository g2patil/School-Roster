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
    const doc = new jsPDF('l', 'mm', 'A4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const columnCount = 16;
    const columnWidth = (pageWidth - 28) / columnCount;
  
    const columns = [
      'Date', 'Voucher No.', 'Particular', 'Txn ID', 'L/F',
      'Cash Amt', 'Bank Amt', 'Saving Amt',
      'Date', 'Voucher No.', 'Particular', 'Txn ID', 'L/F',
      'Cash Amt', 'Bank Amt', 'Saving Amt'
    ];
  
    const rows = transactions.map(txn => ([
      txn[3], txn[1], `${txn[4]}\n${txn[8]}`, txn[6], txn[2],
      (txn[9] || 0).toFixed(2), (txn[10] || 0).toFixed(2), (txn[11] || 0).toFixed(2),
      txn[15], txn[13], `${txn[16]}\n${txn[20]}`, txn[18], txn[14],
      (txn[21] || 0).toFixed(2), (txn[22] || 0).toFixed(2), (txn[23] || 0).toFixed(2)
    ]));
  
    let pageSubtotals = {};
  
    doc.autoTable({
      head: [columns],
      body: rows,
      rowPageBreak: 'avoid',
      startY: 30,
      margin: { left: 14, right: 14, bottom: 30 },
      styles: {
        fontSize: 6,
        cellPadding: 1.5,
      },
      headStyles: {
        fillColor: [0, 0, 0],
        fontSize: 6,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
     /* columnStyles: Array.from({ length: columnCount }).reduce((acc, _, idx) => {
        acc[idx] = { cellWidth: columnWidth };
        return acc;
      }, {}),*/
      columnStyles: Array.from({ length: columnCount }).reduce((acc, _, idx) => {
      // Right-align Cash, Bank, and Saving columns (index 5, 6, 7, 13, 14, 15)
      if ([5, 6, 7, 13, 14, 15].includes(idx)) {
        acc[idx] = { cellWidth: columnWidth, halign: 'right', fontStyle: 'bold', 
          fillColor: '#00FFFF' };
      } /*else if (idx === 2) {
        // Double the width for the "Particular" column (index 2)
        acc[idx] = { cellWidth: columnWidth * 2, halign: 'left' };
      }*/ else {
        acc[idx] = { cellWidth: columnWidth, halign: 'left' };
      }
      return acc;
    }, {}),
      
      willDrawCell: function (data) {
        if (data.section === 'body' && data.column.index === 0) {
          const page = doc.internal.getCurrentPageInfo().pageNumber;
      
          if (!pageSubtotals[page]) {
            pageSubtotals[page] = {
              cash: 0, bank: 0, saving: 0,
              cash1: 0, bank1: 0, saving1: 0
            };
          }
      
          const row = data.row.raw;
          pageSubtotals[page].cash += parseFloat(row[5] || 0);
          pageSubtotals[page].bank += parseFloat(row[6] || 0);
          pageSubtotals[page].saving += parseFloat(row[7] || 0);
          pageSubtotals[page].cash1 += parseFloat(row[13] || 0);
          pageSubtotals[page].bank1 += parseFloat(row[14] || 0);
          pageSubtotals[page].saving1 += parseFloat(row[15] || 0);
        }
      },
      
  
      didDrawPage: function (data) {
        const pageNumber = doc.internal.getNumberOfPages();
        const subtotal = pageSubtotals[pageNumber] || {
          cash: 0, bank: 0, saving: 0,
          cash1: 0, bank1: 0, saving1: 0
        };
  
        const footerData = [
          '', '', { content: 'Page Subtotal', colSpan: 3, styles: { halign: 'center' } },
          subtotal.cash.toFixed(2), subtotal.bank.toFixed(2), subtotal.saving.toFixed(2),
          '', '', { content: 'Page Subtotal', colSpan: 3, styles: { halign: 'center' } },
          subtotal.cash1.toFixed(2), subtotal.bank1.toFixed(2), subtotal.saving1.toFixed(2)
        ];
  
        doc.autoTable({
          body: [footerData],
          startY: pageHeight - 25,
          margin: { left: 14, right: 14 },
          theme: 'plain',
          styles: {
            fontSize: 6,
            fontStyle: 'bold',
            cellPadding: 2,
            textColor: [255, 255, 255],
            fillColor: [0, 200, 0]
          },
          columnStyles: Array.from({ length: columnCount }).reduce((acc, _, idx) => {
            acc[idx] = { cellWidth: columnWidth, halign: 'right' };
            return acc;
          }, {}),
        });
  
        // Page number
        doc.setFontSize(7);
        doc.setTextColor(100);
        doc.text(`Page ${pageNumber}`, pageWidth - 30, pageHeight - 5);
      }
    });
  
    doc.save('transactions_report.pdf');
  };
  
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
