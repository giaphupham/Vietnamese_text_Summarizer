import React, { useState } from 'react';
import { VscAccount } from "react-icons/vsc";
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGem} from '@fortawesome/free-regular-svg-icons'


const AccountButton = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Perform logout logic here
    // You can use axios to call your logout endpoint
    axios.get('http://127.0.0.1:5000//logout',{
      withCredentials: true
    }) // Ensure that cookies are sent along with the request
      .then(response => {
        if (response.status === 200) {
          // Redirect to login page after successful logout
          localStorage.removeItem('email');
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
      </div>

      
  );
};

export default AccountButton;
