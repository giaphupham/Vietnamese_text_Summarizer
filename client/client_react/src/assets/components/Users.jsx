import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import HttpClient from './HttpClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'last_access', direction: 'desc' });
  const [filter, setFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [sortConfig]);

  useEffect(() => {
    setFilteredUsers(users.filter(user => 
      user.name.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
    ));
  }, [filter, users]);

  const fetchUsers = async () => {
    try {
      const response = await HttpClient.get(`${import.meta.env.VITE_REACT_APP_URL}/admin_get_users`);
      const sortedUsers = sortUsers(response.data, sortConfig.key, sortConfig.direction);
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch users');
    }
  };

  const sortUsers = (users, key, direction) => {
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

  const handleBanUser = async (id) => {
    try {
      await HttpClient.put(`${import.meta.env.VITE_REACT_APP_URL}/admin_ban_user`, { email: id});
      fetchUsers();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.error(error.response.data.error);
        toast.error(error.response.data.error, {autoClose: 3000});
        setErrorMessage(error.response.data.error);

      } else {
        console.error(error);
        toast.error('Failed to ban user');

      }
    }
  };

  const handleUnbanUser = async (id) => {
    try {
      await HttpClient.put(`${import.meta.env.REACT_APP_API_URL}/admin_unban_user`, { email: id });
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to unban user');
    }
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
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
      <div className="overflow-y-auto max-h-96">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-green-600">
            <tr>
              {['ID', 'Email', 'Name', 'Role', 'Subscription', 'Created At', 'Last Access', 'Actions'].map((col, idx) => (
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
                <td className="py-2 px-4 border-b border-gray-200 text-left">{user.email}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-left">{user.name}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-left">{user.role}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-left">{user.subscription}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-left">{formatDate(user.created_at)}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-left">{formatDate(user.last_access)}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-left">
                  {user.banned === 'Banned' ? (
                    <button
                      onClick={() => handleUnbanUser(user.email)}
                      className="bg-green-500 text-white py-1 px-2 rounded"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBanUser(user.email)}
                      className="bg-red-500 text-white py-1 px-2 rounded"
                    >
                      Ban
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer containerId={'containerC'}/>
    </div>
  );
};

export default Users;
