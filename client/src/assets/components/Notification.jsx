import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HttpClient from './HttpClient';

const Notification = () => {
  const [notify, setNotify] = useState(true);
  const navigate = useNavigate();

  const handleClick = async () => {
    navigate({ pathname: '/premium' });
  }

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await HttpClient.get(`${import.meta.env.VITE_REACT_APP_URL}/check_subscription`);
        setNotify(response.data.notify);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, []);

  return (
    <>
      {!notify && (
        <div className="flex justify-between bg-yellow-300 p-4 rounded-md">
          <p className="text-black font-semibold">Your subscription ends today!</p>
          <button onClick={handleClick}>
            <a className="text-white font-semibold bg-[#178733] py-2 px-4 rounded-full hover:bg-[#0B6722]">Renew</a>
          </button>
        </div>
      )}
    </>
  );
};

export default Notification;
