import React, { useState, useEffect } from 'react';

const TransactionReport = () => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [accountTypeId, setAccountTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://192.168.1.114:8082/adnya/school/account/account-types', {
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
      const url = `http://192.168.1.114:8082/adnya/account/report?fromDate=${fromDate}&toDate=${toDate}&accountTypeId=${accountTypeId}`;
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

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Transaction Report</h2>

      {/* Account Type Dropdown */}
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

      {/* From Date Input */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>From Date</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* To Date Input */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>To Date</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Fetch Button */}
      <button
        onClick={fetchTransactionReport}
        disabled={loading}
        style={loading ? styles.buttonLoading : styles.button}
      >
        {loading ? 'Loading...' : 'Fetch Report'}
      </button>

      {/* Transaction Table */}
      <div style={styles.tableContainer}>
        {transactions.length > 0 ? (
          <table style={styles.table} cellPadding="10" cellSpacing="0">
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
  );
};

// Styles for professional accounting ledger look
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
    border: '1px solid #ddd',  // Added border to the table itself
  },
  th: {
    padding: '12px 15px',
    backgroundColor: '#f2f2f2',
    fontWeight: '600',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #ddd',
    textAlign: 'left',
  },
  rightAlign: {
    textAlign: 'right',
    paddingRight: '15px',
    paddingLeft: '10px',
  },
  evenRow: {
    backgroundColor: '#f9f9f9', // Light background for even rows
  },
  oddRow: {
    backgroundColor: '#ffffff', // White background for odd rows
  },
};

export default TransactionReport;
