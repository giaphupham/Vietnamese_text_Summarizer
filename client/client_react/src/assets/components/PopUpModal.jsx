import React from "react";
import { useState } from "react";
import axios from "axios";



const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
  
    const handleChangePassword = async () => {
      if (newPassword !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      if (newPassword == "" || confirmPassword == "") {
        setError("Password cannot be empty");
        return;
      }
      
      const email = localStorage.getItem('email');
      try {
        // Make a POST request to your Flask backend to change the password
        const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/change_password`, {
            new_password: newPassword,
            email: email,
          // Pass any necessary data for changing the password
          // For example, you might need to pass the new password, user id, etc.
        });
  
        // Handle success
        setSuccess(true);
        setError(null);
        onClose();
        alert('Password changed successfully!');
      } catch (error) {
        // Handle error
        setSuccess(false);
        setError(error.message);
      }
    };
  
    return (
      <div className={`${isOpen ? 'block' : 'hidden'} fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-50 flex items-center justify-center`}>
        <div className="bg-white p-8 w-1/2 rounded-lg">
          <h2 className="text-2xl mb-4">Change Password</h2>
          <input
            type="password"
            placeholder="New Password"
            className="border border-gray-400 p-2 mb-4 w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="border border-gray-400 p-2 mb-4 w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">Password changed successfully!</div>}
          <div className="flex justify-end">
            <button
              onClick={handleChangePassword}
              className="bg-[#178733] hover:bg-[#0B6722] text-white font-bold py-2 px-4 rounded-full mr-4"
            >
              Change Password
            </button>
            <button onClick={onClose} className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

export default ChangePasswordModal;