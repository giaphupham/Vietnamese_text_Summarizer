import React, { useState } from 'react';
import axios from 'axios';
import Modal from './ConfirmModal';
import HttpClient from './HttpClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ApproveAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');

  const handleApproveAdmin = () => {
    setIsOpen(true); // Open the modal when the "Approve" button is clicked
  };

  const handleCloseModal = () => {
    setIsOpen(false); // Close the modal when the "Cancel" button is clicked
  };

  const admin = localStorage.getItem('email');

  const handleConfirmModal = async () => {
    try {
      // Fetch admin's email and password from inputs and send the request
      await HttpClient.post('http://127.0.0.1:5000/admin_approve_admin', { 'username':username, 'password':password, 'admin':admin });
      // Handle success, maybe show a success message or redirect to another page
      toast.success('Admin approved successfully');
    } catch (error) {
      setErrorMessage(error || 'Failed to approve admin');
    } finally {
      setIsOpen(false); // Close the modal after the request is sent
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Approve Admin</h2>
      <div className="mb-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border py-2 px-4 w-full"
          placeholder="User's Email"
        />
      </div>
      <button onClick={handleApproveAdmin} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Approve
      </button>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmModal}
        errorMessage={errorMessage}
        setPassword={setPassword}
      />

    </div>
  );
};

export default ApproveAdmin;
