import React, { useEffect, useState } from 'react';
import Users from '../components/Users';
import SalesReport from '../components/SaleReport';
import ApproveAdmin from '../components/ApproveAdmin';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('users');
  const navigate = useNavigate();
  
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_REACT_APP_URL}/home`, { withCredentials: true })
        .then(response => {
            if (response.status === 200) {
                console.log(response.data.message);
            } else {
                throw new Error('You have to log in first');
            }
        })
        .catch(error => {
            console.error(error);
            // Redirect to login page
            navigate('/Login');
        });
  },[]);

  return (
    <div>
    <NavBar isLogin={true}/>
    <div className='pt-4 mx-4'>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <nav className="mb-4">
        <button
          onClick={() => setActiveSection('users')}
          className={`mr-4 border-b-2 border-white hover:border-green-700 ${activeSection === 'users' ? 'text-green-700 !border-green-700' : 'text-gray-500'}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveSection('sales')}
          className={`mr-4 border-b-2 border-white hover:border-green-700 ${activeSection === 'sales' ? 'text-green-700 !border-green-700' : 'text-gray-500'}`}
        >
          Sales Report
        </button>
        <button
          onClick={() => setActiveSection('approve')}
          className={`border-b-2 border-white hover:border-green-700 ${activeSection === 'approve' ? 'text-green-700 !border-green-700' : 'text-gray-500'}`}
        >
          Approve Admin
        </button>
      </nav>
      <div className=''>
        {activeSection === 'users' && <Users />}
        {activeSection === 'sales' && <SalesReport />}
        {activeSection === 'approve' && <ApproveAdmin />}
      </div>
    </div>
    </div>
  );
};

export default {
    routeProps: {
        path: "/admin",
        main: AdminPage,
    },
};