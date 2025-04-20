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
  });

  const [subHeads, setSubHeads] = useState([]);
  const [accountTypeId, setAccountTypeId] = useState('');
  const [accountMainHeadId, setAccountMainHeadId] = useState('');

  // Load Sub Heads on page load
  useEffect(() => {
    fetch('http://192.168.1.114:8082/adnya/school/account/account-sub-heads', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(res => res.text())
      .then(responseText => {
        if (responseText.trim() === '') return;
        try {
          const jsonData = JSON.parse(responseText);
          console.log("1"+responseText);
          setSubHeads(jsonData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      })
      .catch(error => console.error('Error fetching sub-heads:', error));
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  
    if (name === 'accountSubHeadId' && value) {
      try {
        const res = await fetch(`http://192.168.1.114:8082/adnya/account/sub-head-detail?s=${value}`, {
          credentials: 'include',
        });
  
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
  
        const jsonData = await res.json();
        const data = jsonData[0];
        console.log("Fetched SubHead Detail:", data);
  
        setFormData((prev) => ({
          ...prev,
          accountTypeId: data.account_type_id,
          accountMainHeadId: data.account_main_head_id,
        }));

       console.log("@@@@@@"+data.account_main_head_id);
        setAccountTypeId(data.account_type_id);  // 👉 Add this here
        setAccountMainHeadId(data.account_main_head_id); 
       // setAccountTypeId(data.accountTypeId);
      //  setAccountMainHeadId(data.accountMainHeadId);
      } catch (err) {
        console.error('Error fetching accountType/mainHead:', err);
      }
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://192.168.1.114:8082/adnya/school/account/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });
    console.log("Form Data Payload:", JSON.stringify(formData, null, 2));
    if (response.ok) {
      alert('Transaction added successfully');
      setFormData({
        transactionDate: '',
        amount: '',
        paymentMode: '',
        description: '',
        accountSubHeadId: '',
        accountTypeId: '',
        accountMainHeadId: '',
        userId: 2,
      });
      setAccountTypeId('');
      setAccountMainHeadId('');
     
    } else {
      alert('Failed to add transaction');
    }
  };

  return (
    <div style={{ padding: '20px', width: '100%', overflowX: 'auto' }}>
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

        {/* Auto-generated Main Head */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Main Head</label>
          <input
            type="text"
            value={formData.accountMainHeadId}
            readOnly
            style={{ width: '160px', padding: '6px', backgroundColor: '#f2f2f2' }}
          />
        </div>

        {/* Auto-generated Account Type */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
  <label>Account Type</label>
  <input
    type="text"
    value={formData.accountTypeId ?? ''}
    
    onChange={(e) => setAccountTypeId(e.target.value)}
    readOnly
    style={{ width: '150px', padding: '6px', backgroundColor: '#f2f2f2' }}
  />
</div>

        {/* Date Input */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Date</label>
          <input
            type="date"
            name="transactionDate"
            value={formData.transactionDate}
            onChange={handleChange}
            style={{ width: '130px', padding: '6px' }}
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
          <label>Mode</label>
          <select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            style={{ width: '100px', padding: '6px' }}
            required
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
        <div style={{ marginTop: '24px' }}>
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
    </div>
  );
};

export default AddSchoolTransaction;



/*import React, { useState, useEffect } from 'react';

const AddSchoolTransaction = () => {
  const [formData, setFormData] = useState({
    transactionDate: '',
    amount: '',
    paymentMode: '',
    description: '',
    accountSubHeadId: '',
    userId: 2,
  });

  const [subHeads, setSubHeads] = useState([]);


  useEffect(() => {
    fetch('http://192.168.1.114:8082/adnya/school/account/account-sub-heads', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(res => res.text())
      .then(responseText => {
        if (responseText.trim() === '') return;
        try {
          const jsonData = JSON.parse(responseText);
          console.log(responseText);
          setSubHeads(jsonData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      })
      .catch(error => console.error('Error fetching sub-heads:', error));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://192.168.1.114:8082/adnya/school/account/add', {
      method: 'POST',
     // headers: { 'Content-Type': 'application/json' },
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include', 
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert('Transaction added successfully');
      setFormData({
        transactionDate: "2025-04-20",
        amount: 1200.50,
        paymentMode: "Cash",
        description: "Admission Fee",
        accountTypeId: 1,
        accountMainHeadId: 1,
        accountSubHeadId: 1,
        userId: 2
      });
    } else {
      alert('Failed to add transaction');
    }
  };

  return (
    <div style={{ padding: '20px', width: '100%', overflowX: 'auto' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Date</label>
          <input
            type="date"
            name="transactionDate"
            value={formData.transactionDate}
            onChange={handleChange}
            style={{ width: '130px', padding: '6px' }}
            required
          />
        </div>
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


        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Mode</label>
          <select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            style={{ width: '100px', padding: '6px' }}
            required
          >
            <option value="">Select</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

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

       

      

        <div style={{ marginTop: '24px' }}>
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
    </div>
  );
};

export default AddSchoolTransaction;*/
