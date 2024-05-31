import React, { useState } from 'react';
import { VscAccount } from "react-icons/vsc";
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGem} from '@fortawesome/free-regular-svg-icons'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HttpClient from './HttpClient';


const AccountButton = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Perform logout logic here
    // You can use axios to call your logout endpoint
    HttpClient.get(`${import.meta.env.VITE_REACT_APP_URL}/logout`,{
    }) // Ensure that cookies are sent along with the request
      .then(response => {
        if (response.status === 200) {
          // Redirect to login page after successful logout
          localStorage.removeItem('email');
          localStorage.removeItem('role');
          navigate({ pathname: '/Login' })
        } else {
          // Handle logout failure
          console.error('Logout failed');
          toast.error('Logout failed', {autoClose: 3000});
        }
      })
      .catch(error => {
        console.error('Error during logout:', error);
        toast.error('Error during logout', {autoClose: 3000});
      });
  };

  const handleProfile = () => { 
    navigate({ pathname: '/profile' })
  }


  return (
    <div className="flex flex-wrap content-center items-center">
      <button 
        className="bg-[#178733] mx-2 px-10 py-1.5 rounded-full flex flex-wrap items-center hover:bg-[#0B6722]"
        onClick={() => navigate('/premium')}
      >
        <FontAwesomeIcon icon={faGem} className='text-white '  />
        <div className='text-white font-medium pl-2'>Upgrade to Premium</div>
      </button>
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
              onClick={handleProfile}
            >
              Profile
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
      <ToastContainer containerId={'containerA'}/>
      </div>

      
  );
};

export default AccountButton;
