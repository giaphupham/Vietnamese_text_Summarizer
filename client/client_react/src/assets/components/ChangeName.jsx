import React from "react";
import { useState } from "react";
import axios from "axios";


const ChangeNameModal = ({ isOpen, onClose }) => {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [NewName, setNewName] = useState('');
  
    const handleChangeName= async () => {
      
      const email = localStorage.getItem('email');
      try {
        // Make a POST request to your Flask backend to change the NamesetNewName
        const response = await axios.post(`${import.meta.env.VITE_REACT_APP_API_URL}/change_name`, {
            new_name: NewName,
            email: email,
          // Pass any necessary data for changing the Name
          // For example, you might need to pass the new Name, user id, etc.
        });
  
        // Handle success
        setSuccess(true);
        setError(null);
        window.location.reload();
        onClose();
      } catch (error) {
        // Handle error
        setSuccess(false);
        setError(error.message);
      }
    };
  
    return (
      <div className={`${isOpen ? 'block' : 'hidden'} fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-50 flex items-center justify-center`}>
        <div className="bg-white p-8 w-1/2 rounded-lg">
          <h2 className="text-2xl mb-4">Change Name</h2>
          <input
            type="Name"
            placeholder="New Name"
            className="border border-gray-400 p-2 mb-4 w-full"
            value={NewName}
            onChange={(e) => setNewName(e.target.value)}
          />
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">Name changed successfully!</div>}
          <div className="flex justify-end">
            <button
              onClick={handleChangeName}
              className="bg-[#178733] hover:bg-[#0B6722] text-white font-bold py-2 px-4 rounded-full mr-4"
            >
              Change Name
            </button>
            <button onClick={onClose} className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

export default ChangeNameModal;