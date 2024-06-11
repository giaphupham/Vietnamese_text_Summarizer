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
  const [ConfirmType, setConfirmType] = useState('');


  const handleApproveAdmin = () => {
    setConfirmType('approve');
    setIsOpen(true); // Open the modal when the "Approve" button is clicked
  };

  const handleDeleteAdmin = () => {
    setConfirmType('remove');
    setIsOpen(true); // Open the modal when the "Delete" button is clicked
  };

  const handleCloseModal = () => {
    setIsOpen(false); // Close the modal when the "Cancel" button is clicked
  };

  const admin = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  const handleConfirmModal = async () => {
    try {

      const apiUrl = ConfirmType === 'remove' ? `${import.meta.env.VITE_REACT_APP_URL}/admin_delete_admin` : `${import.meta.env.VITE_REACT_APP_URL}/admin_approve_admin`;
      // Fetch admin's email and password from inputs and send the request
      await HttpClient.post(apiUrl, { 'username':username, 'password':password, 'admin':admin });
      // Handle success, maybe show a success message or redirect to another page
      toast.success(`Admin ${ConfirmType} successfully`);
    } catch (error) {
      setErrorMessage(error || 'Failed to approve admin');
    } finally {
      //toast.success(`Admin ${ConfirmType} successfully`);
      setIsOpen(false); // Close the modal after the request is sent
    }
  };


  return (
    <div>
      {role === 's_admin' ? (
        <div>
      <h2 className="text-2xl font-semibold mb-4">Approve or Remove Admin</h2>
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
          <button
            onClick={handleDeleteAdmin}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
          >
            Remove
          </button>
          </div>
      ) : (<div>
      <h2>Only super admin can do this </h2>
      </div>)}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmModal}
        errorMessage={errorMessage}
        setPassword={setPassword}
      />
      <ToastContainer containerId={'containerE'} />
    </div>
  );
};

export default ApproveAdmin;
