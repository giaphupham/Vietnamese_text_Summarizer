import React, { useState } from 'react';
import { VscAccount } from "react-icons/vsc";
import axios from 'axios';
import { useNavigate } from 'react-router-dom'


const AccountButton = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Perform logout logic here
    // You can use axios to call your logout endpoint
    axios.get('http://127.0.0.1:5000//logout') // Ensure that cookies are sent along with the request
      .then(response => {
        if (response.status === 200) {
          // Redirect to login page after successful logout
          navigate({ pathname: '/Login' })
        } else {
          // Handle logout failure
          console.error('Logout failed');
        }
      })
      .catch(error => {
        console.error('Error during logout:', error);
      });
  };


  return (
    
      <button
        onClick={toggleDropdown}
        type="button"
      >  
        <VscAccount className='text-3xl'/>

        {isDropdownOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          {/* Dropdown content goes here */}
          <div className="py-1">
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Profile
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Settings
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              Sign out
            </a>
          </div>
        </div>
      )}
      </button>

      
  );
};

export default AccountButton;
