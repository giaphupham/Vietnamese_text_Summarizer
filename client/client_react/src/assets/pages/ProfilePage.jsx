import React, {useEffect, useState} from 'react';
import NavBar from '../components/NavBar';
import { VscAccount } from "react-icons/vsc";
import { MdCreditScore } from "react-icons/md";
import axios from 'axios';

function UserProfile(){
  const [userData, setUserData] = useState(NaN);
  const [showProfile, setShowProfile] = useState(false);

  const user = localStorage.getItem('email');
  console.log(user);
  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/profile', {
                username: user ,
            });
            setUserData(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    fetchUserData();
  }, []);

  const generateAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  };

  const getSubscriptionType = (type) => {
    switch (type) {
        case 0:
            return 'Free Tier';
        case 1:
            return 'Pro';
        case 2:
            return 'Premium';
        default:
            return 'Unknown';
    }
  };

  return (
    <div>
    <NavBar isLogin={true}/>
    <div className="flex flex-col items-center justify-center mt-12 w-full max-w-6xl mx-auto">
        <div className="px-6 py-6 min-w-full">
          <div className="flex items-center">
            <img
              className="h-24 w-24 rounded-full object-cover"
              src={generateAvatarUrl(userData.name)}
            />
            <div className='flex flex-col text-2xl px-12 font-light'>
                <b className='font-semibold '>{userData.name}</b>
                <b className='font-normal text-base text-slate-700 pt-2'>{user}</b>
            </div>
          </div>
        <div className='flex justify-center mt-4'>
            <div className='flex flex-col w-40 mt-6 border-l-2 h-full'>
                <div 
                    className='flex items-center px-4 py-2  border-gray-300 cursor-pointer hover:bg-gray-200 hover:rounded-md'
                    onClick={() => setShowProfile(true)}
                >
                    <VscAccount/>
                    <p className='pl-2'>Profile</p>
                </div>
                <div 
                    className='flex items-center px-4 py-2  border-gray-300 cursor-pointer hover:bg-gray-200 hover:rounded-md'
                    onClick={() => setShowProfile(false)}
                >
                    <MdCreditScore />
                    <p className='pl-2'>Subscription</p>
                </div>
            </div>
          {
            showProfile ?
            <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden px-8 py-10 max-w-3xl w-full ml-6">
              <h1 className="text-sm text-gray-600 p-6">Name: {userData.name}</h1>
              <p className="text-sm text-gray-600 p-6">Email: {user}</p>
              <p className="text-sm text-gray-600 p-6">Subscription: {getSubscriptionType(userData.subscription)}</p>
              <p className="text-sm text-gray-600 p-6">Joined at: {new Date(userData.created_at).toLocaleString()}</p>
            </div> :
            <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden px-8 py-10 max-w-3xl w-full ml-6">
              <p className="text-sm text-gray-600 p-6">Current Plan: </p>
              <p className='text-lg px-6'>{getSubscriptionType(userData.subscription)}</p>
            </div>
          }
        </div>
        </div>
      </div>
    </div>
  );
};

export default {
    routeProps: {
        path: "/profile",
        main: UserProfile,
    },
};
