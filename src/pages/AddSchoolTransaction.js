
import React, { useState, useEffect } from 'react';
import config from "../config";


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

  // Fetch main heads based on selected account type
  useEffect(() => {
    if (!formData.accountTypeId) return;
    
    fetch(
      `${config.API_URL}/school/account/main-head/by-account-type/${formData.accountTypeId}`,
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

  fetch(`${config.API_URL}/account/sub-head/by-main-head_01/?mainHeadId=${formData.accountMainHeadId}&accountTypeId=${formData.accountTypeId}`, {
     
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

  const response = await fetch(`${config.API_URL}/school/account/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    alert('Transaction added successfully');
   /* setFormData({
      transactionDate: '',
      amount: '',
      paymentMode: '',
      cash_bank: '',
      description: '',
      accountSubHeadId: '',
      accountTypeId: '',
      accountMainHeadId: '',
      userId: 2,
    });*/
    //if (!lastTransaction) {
      await fetchLastTransaction();
   // }
  } else {
    alert('Failed to add transaction');
  }
};


  const [lastTransaction, setLastTransaction] = useState(null);
  const fetchLastTransaction = async () => {
    try {
      const res = await fetch(`${config.API_URL}/school/account/transactions/today`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('Response failed with status:', res.status);
        return;
      }
  
   //   console.log('Response status:', res.status); // 🔥 Check HTTP status code
     // const text = await res.text(); // Read raw response
    //  console.log('Raw response:', text);
  
    //  const data = await  JSON.parse(text); // Parse JSON manually
    //  console.log('Parsed JSON:', data);
    const data = await res.json();
    console.log('Parsed JSON:', data);
      setLastTransaction(data);
     // fetchLastTransaction();
    } catch (err) {
      console.error('Error fetching last transaction:', err.message);
    }
  };
  
  useEffect(() => {
    fetchLastTransaction();
  },[]);

  const handleModify = (id) => {
    alert(`Modify clicked for transaction ID: ${id}`);
  };
  
  const handleDelete = (id) => {
    alert(`Delete clicked for transaction ID: ${id}`);
  };

  

  


  return (
    <div className="form-container">
    <div style={{ padding: '10px', width: '95%', overflowX: 'auto', textAlign: 'center' }}>
      <h2>Add School Transaction</h2>
      <form
  onSubmit={handleSubmit}
  style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    alignItems: 'flex-start',
    padding: '5px',
    backgroundColor: '#f9f9f9',
    borderRadius: '3px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  }}
>
  {/* Account Type */}
  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
    <label style={{ marginBottom: '6px', fontWeight: '500' }}>Account Type</label>
    <select
      name="accountTypeId"
      value={formData.accountTypeId}
      onChange={handleChange}
      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
    >
      <option value="">Select</option>
      {accountTypes.map((type) => (
        <option key={type.accountTypeId} value={type.accountTypeId}>
          {type.accountType}
        </option>
      ))}
    </select>
  </div>

  {/* Main Head */}
  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '180px' }}>
    <label style={{ marginBottom: '6px', fontWeight: '500' }}>Main Head</label>
    <select
      name="accountMainHeadId"
      value={formData.accountMainHeadId}
      onChange={handleChange}
      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
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

  {/* Sub Head */}
  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '180px' }}>
    <label style={{ marginBottom: '6px', fontWeight: '500' }}>Sub Head</label>
    <select
      name="accountSubHeadId"
      value={formData.accountSubHeadId}
      onChange={handleChange}
      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
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

  {/* Date */}
  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '130px' }}>
    <label style={{ marginBottom: '6px', fontWeight: '500' }}>Date</label>
    <input
      type="date"
      name="transactionDate"
      value={formData.transactionDate}
      onChange={handleChange}
      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      required
    />
  </div>

  {/* Amount */}
  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '130px' }}>
    <label style={{ marginBottom: '6px', fontWeight: '500' }}>Amount</label>
    <input
      type="number"
      name="amount"
      value={formData.amount}
      onChange={handleChange}
      min="0.01"
      step="0.01"
      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      required
    />
  </div>

  {/* Cash Bank */}
  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '100px' }}>
    <label style={{ marginBottom: '6px', fontWeight: '500' }}>Cash/Bank</label>
    <select
      name="cash_bank"
      value={formData.cash_bank}
      onChange={handleChange}
      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
      required
    >
      <option value="">Select</option>
      <option value="Cash">Cash</option>
      <option value="Bank">Bank</option>
      <option value="Saving Bank">Saving Bank</option>
    </select>
  </div>

  {/* Payment Mode (hidden) */}
  <div style={{ display: 'none', flexDirection: 'column' }}>
    <label style={{ marginBottom: '6px', fontWeight: '500' }}>Mode</label>
    <select
      name="paymentMode"
      value={formData.paymentMode}
      onChange={handleChange}
      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
    >
      <option value="">Select</option>
      <option value="Cash">Cash</option>
      <option value="Online">Online</option>
      <option value="Cheque">Cheque</option>
    </select>
  </div>

  {/* Description */}
  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
    <label style={{ marginBottom: '6px', fontWeight: '500' }}>Description</label>
    <input
      type="text"
      name="description"
      value={formData.description}
      onChange={handleChange}
      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
    />
  </div>

  {/* Submit Button */}
  <div style={{ flexBasis: '100%', textAlign: 'center', marginTop: '30px' }}>
    <button
      type="submit"
      style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
      onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
    >
      Submit
    </button>
  </div>
</form>
      <div style={{ padding: '20px' }}>
      <h2>Latest 5 Transactions</h2>
      <table
  border="1"
  cellPadding="5"
  cellSpacing="0"
  style={{
    width: '90%',
    borderCollapse: 'collapse',
    fontSize: '12px',       // smaller font
    fontFamily: 'Arial, sans-serif', // professional font
  }}
>
  <thead>
    <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'center' }}>
      <th>Transaction Date</th>
      <th>Account Main Head</th>
      <th>Account Sub Head</th>
      <th>Transaction ID</th>
      <th>Amount</th>
      <th>Cash/Bank</th>
      <th>Description</th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    {Array.isArray(lastTransaction) && lastTransaction.length > 0 ? (
      lastTransaction.map((txn) => (
        <tr key={txn.transaction_id}>
          <td style={{ textAlign: 'center' }}>{txn.transaction_date}</td>
          <td style={{ textAlign: 'left' }}>{txn.account_main_head}</td>
          <td style={{ textAlign: 'left' }}>{txn.account_sub_head}</td>
          <td style={{ textAlign: 'center' }}>{txn.transaction_id}</td>
          <td style={{ textAlign: 'right' }}>{txn.amount}</td>
          <td>{txn.cash_bank}</td>
          <td style={{ textAlign: 'left' }}>{txn.description}</td>
       
    {/* your transaction view */}
         <td><button onClick={() => handleModify(txn.transaction_id)} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px' }}>
        Modify
      </button></td>
      <td><button onClick={() => handleDelete(txn.transaction_id)} style={{ backgroundColor: '#f44336', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px' }}>
        Delete
      </button></td>
     
        
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
    </div>
  );
};

export default AddSchoolTransaction;
