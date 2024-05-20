import React, { useState } from 'react';
import axios from 'axios';
import HttpClient from './HttpClient';

const ApproveAdmin = () => {
  const [newAdmin, setNewAdmin] = useState('');
  const [message, setMessage] = useState('');

  const handleApproveAdmin = async () => {
    try {
      const response = await HttpClient.post('http://127.0.0.1:5000//admin_approve_admin', { username: newAdmin });
      setMessage(response.data.message);
      setNewAdmin('');
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Approve Admin</h2>
      <div className="flex items-center mb-2">
        <input
          type="text"
          value={newAdmin}
          onChange={(e) => setNewAdmin(e.target.value)}
          className="border py-2 px-4 mr-2"
          placeholder="Enter username"
        />
        <button onClick={handleApproveAdmin} className="bg-blue-500 text-white py-2 px-4">
          Approve Admin
        </button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ApproveAdmin;
