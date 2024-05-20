import React, { useEffect, useState } from 'react';
import Users from '../components/Users';
import SalesReport from '../components/SaleReport';
import ApproveAdmin from '../components/ApproveAdmin';

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState('users');

  return (
    <div className="p-4">
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
      <div>
        {activeSection === 'users' && <Users />}
        {activeSection === 'sales' && <SalesReport />}
        {activeSection === 'approve' && <ApproveAdmin />}
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