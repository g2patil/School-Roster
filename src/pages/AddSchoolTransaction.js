
import React, { useState, useEffect } from 'react';

const AddSchoolTransaction = () => {
  const [formData, setFormData] = useState({
    transactionDate: '',
    amount: '',
    paymentMode: '',
    description: '',
    accountSubHeadId: '',
    accountTypeId: '',
    accountMainHeadId: '',
    userId: 2,
    cash_bank:'',
  });

  const [subHeads, setSubHeads] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [mainHeads, setMainHeads] = useState([]);

  // Fetch account types
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

  // Fetch main heads based on selected account type
  useEffect(() => {
    if (!formData.accountTypeId) return;
    
    fetch(
      `http://192.168.1.114:8082/adnya/school/account/main-head/by-account-type/${formData.accountTypeId}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const cleaned = data.map((item) => ({
          mainHeadId: item.accountMainHeadId,
          mainHeadName: item.accountMainHead,
        }));
        console.log('Main Heads:', cleaned);
        setMainHeads(cleaned);
      })
      .catch((err) => console.error('Fetch error:', err));
  }, [formData.accountTypeId]);

  // Fetch sub-heads based on account main head
  useEffect(() => {
    if (!formData.accountMainHeadId) return;

   // fetch(`http://192.168.1.114:8082/adnya/account/sub-head/by-main-head/${formData.accountMainHeadId}`, {
    fetch(`http://192.168.1.114:8082/adnya/account/sub-head/by-main-head_01/?mainHeadId=${formData.accountMainHeadId}&accountTypeId=${formData.accountTypeId}`, {
     
   method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Sub Heads:', data);
        setSubHeads(data);
      })
      .catch((error) => console.error('Error fetching sub-heads:', error));
  }, [formData.accountMainHeadId,formData.accountTypeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 /* const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://192.168.1.114:8082/adnya/school/account/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    console.log('Form Data Payload:', JSON.stringify(formData, null, 2));
    if (response.ok) {
      alert('Transaction added successfully');
      setFormData({
        transactionDate: '',
        amount: '',
        paymentMode: '',
        cash_bank: '',
        description: '',
        accountSubHeadId: '',
        accountTypeId: '',
        accountMainHeadId: '',
        userId: 2,
      });
    } else {
      alert('Failed to add transaction');
    }
  };
*/

const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    transactionDate: formData.transactionDate,
    amount: parseFloat(formData.amount),
    paymentMode: formData.paymentMode || formData.cash_bank,  // since your paymentMode select is hidden
    description: formData.description,
    accountType: { accountTypeId: Number(formData.accountTypeId) },
    accountMainHead: Number(formData.accountMainHeadId),
    accountSubHead: Number(formData.accountSubHeadId),
    cash_bank: formData.cash_bank,
    user: formData.userId
  };

  console.log('Payload being sent:', JSON.stringify(payload, null, 2));

  const response = await fetch('http://192.168.1.114:8082/adnya/school/account/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    alert('Transaction added successfully');
    setFormData({
      transactionDate: '',
      amount: '',
      paymentMode: '',
      cash_bank: '',
      description: '',
      accountSubHeadId: '',
      accountTypeId: '',
      accountMainHeadId: '',
      userId: 2,
    });
  } else {
    alert('Failed to add transaction');
  }
};


  const [lastTransaction, setLastTransaction] = useState(null);
  const fetchLastTransaction = async () => {
    try {
      const res = await fetch(`http://192.168.1.114:8082/adnya/school/account/transactions/today`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('Response failed with status:', res.status);
        return;
      }
  
      console.log('Response status:', res.status); // 🔥 Check HTTP status code
      const text = await res.text(); // Read raw response
      console.log('Raw response:', text);
  
      const data = JSON.parse(text); // Parse JSON manually
      console.log('Parsed JSON:', data);
  
      setLastTransaction(data);
      fetchLastTransaction();
    } catch (err) {
      console.error('Error fetching last transaction:', err.message);
    }
  };
  
  useEffect(() => {
    fetchLastTransaction();
  }, []);



  

  /*const fetchLastTransaction = async () => {
    try {
      const res = await fetch(`http://192.168.1.114:8082/adnya/school/account/last-txn`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      console.log('Last Transaction:', data);
      setLastTransaction(data);
    } catch (err) {
      console.error('Error fetching last transaction:', err);
    }
  };*/


  return (
    <div style={{ padding: '20px', width: '100%', overflowX: 'auto', textAlign: 'center' }}>
      <h2>Add School Transaction</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
          flexWrap: 'nowrap',
        }}
      >
        {/* Account Type Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Account Type</label>
          <select
            name="accountTypeId"
            value={formData.accountTypeId}
            onChange={handleChange}
            style={{ width: '100px', padding: '6px' }}
          >
            <option value="">Select</option>
            {accountTypes.map((type) => (
              <option key={type.accountTypeId} value={type.accountTypeId}>
                {type.accountType}
              </option>
            ))}
          </select>
        </div>

        {/* Main Head Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Main Head</label>
          <select
            name="accountMainHeadId"
            value={formData.accountMainHeadId}
            onChange={handleChange}
            style={{ width: '150px', padding: '6px' }}
            disabled={!formData.accountTypeId}
          >
            <option value="">Select</option>
            {mainHeads.map((head) => (
              <option key={head.mainHeadId} value={head.mainHeadId}>
                {head.mainHeadName}
              </option>
            ))}
          </select>
        </div>

        {/* Sub Head Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Sub Head</label>
          <select
            name="accountSubHeadId"
            value={formData.accountSubHeadId}
            onChange={handleChange}
            style={{ width: '150px', padding: '6px' }}
            required
          >
            <option value="">Select</option>
            {subHeads.map((head) => (
              <option key={head.accountSubHeadId} value={head.accountSubHeadId}>
                {head.accountSubHead}
              </option>
            ))}
          </select>
        </div>

        {/* Date Input */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Date</label>
          <input
            type="date"
            name="transactionDate"
            value={formData.transactionDate}
            onChange={handleChange}
            style={{ width: '100px', padding: '6px' }}
            required
          />
        </div>

        {/* Amount Input */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            style={{ width: '100px', padding: '6px' }}
            required
          />
        </div>

        {/* Payment Mode */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Cash Bank</label>
          <select
            name="cash_bank"
            value={formData.cash_bank}
            onChange={handleChange}
            style={{ width: '80px', padding: '6px' }}
            required
          >
            <option value="">Select</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
            </select>
        </div>


        {/* Payment Mode */}
        <div style={{ display: 'none', flexDirection: 'column' }}>
          <label>Mode</label>
          <select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            style={{ width: '40px', padding: '6px' }}
           // required
          >
            <option value="">Select</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ width: '160px', padding: '6px' }}
          />
        </div>

        {/* Submit Button */}
        
        <div style={{ flexBasis: '100%', marginTop: '24px', textAlign: 'center' }}>
          <button
            type="submit"
            style={{
              padding: '8px 14px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </div>
      </form>
      <div style={{ padding: '20px' }}>
      <h2>Latest 5 Transactions</h2>
      <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Transaction Date</th>
            <th>Amount</th>
            <th>Payment Mode</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
        {Array.isArray(lastTransaction) && lastTransaction.length > 0 ? (
  lastTransaction.map((txn) => (
    <tr key={txn.transactionId}>
      <td>{txn.transactionId}</td>
      <td>{txn.transactionDate}</td>
      <td>{txn.amount}</td>
      <td>{txn.paymentMode}</td>
      <td>{txn.description}</td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="5" style={{ textAlign: 'center' }}>No transactions found</td>
  </tr>
)}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default AddSchoolTransaction;
