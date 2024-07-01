import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import HttpClient from './HttpClient';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';


const FeedBacks = () => {
  const [feedback, setFeedBack] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'create_at', direction: 'desc' });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [sortConfig]);


  const fetchUsers = async () => {
    try {
      const response = await HttpClient.get(`${import.meta.env.VITE_REACT_APP_URL}/admin_get_feedback`);
      const sortedUsers = sortFeedBack(response.data, sortConfig.key, sortConfig.direction);
      setFeedBack(sortedUsers);
      setFilteredUsers(sortedUsers);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch users');
    }
  };

  const sortFeedBack = (users, key, direction) => {
    return [...users].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  };



  return (
    <div>
      <h2 className="text-5xl font-semibold mb-8 text-center">Users Management</h2>
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          placeholder="Search by name or email"
        />
      </div>
      <div className="overflow-y-auto max-h-96">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-green-600">
            <tr>
              {['ID','STAR','COMMENT' ,'Created At', 'USER'].map((col, idx) => (
                <th
                  key={idx}
                  className="py-3 px-4 border-b-2 border-gray-200 cursor-pointer text-left"
                  onClick={() => handleSort(col.toLowerCase().replace(' ', '_'))}
                >
                  {col}
                  {sortConfig.key === col.toLowerCase().replace(' ', '_') && (
                    <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-green-50">
                <td className="py-2 px-4 border-b border-gray-200 text-left">{user.id}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-left">{user.star}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-left">{user.comment}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-left">{formatDate(user.created_at)}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-left">{user.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer containerId={'User'}/>
    </div>
  );
};

export default FeedBacks;
