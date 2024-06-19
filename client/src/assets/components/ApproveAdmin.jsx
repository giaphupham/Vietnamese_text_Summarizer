import React, { useState } from 'react';
import Modal from './ConfirmModal';
import HttpClient from './HttpClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { set } from 'date-fns';

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

    const apiUrl = ConfirmType === 'remove' ? `${import.meta.env.VITE_REACT_APP_URL}/admin_delete_admin` : `${import.meta.env.VITE_REACT_APP_URL}/admin_approve_admin`;
    // Fetch admin's email and password from inputs and send the request
    await HttpClient.post(apiUrl, { 'username':username, 'password':password, 'admin':admin }

    ).then(response => {
    // Handle success, maybe show a success message or redirect to another page
      setIsOpen(false);
      toast.success(`Admin ${ConfirmType} successfully`, {autoClose: 3000, containerId: 'containerE'});

    }
    ).catch(error => {
      setIsOpen(false);
      toast.error(error.response.data.error, {autoClose: 3000, containerId: 'containerE'});
    });
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
