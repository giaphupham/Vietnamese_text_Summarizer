import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { VscAccount } from "react-icons/vsc";
import { MdCreditScore } from "react-icons/md";
import axios from 'axios';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../components/PopUpModal';
import { FaPen } from "react-icons/fa6";
import ChangeNameModal from '../components/ChangeName';
import HttpClient from '../components/HttpClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserProfile() {
  const [userData, setUserData] = useState(NaN);
  const [showProfile, setShowProfile] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangeName, setIsChangeName] = useState(false);

  const openChangeName = () => {
    setIsChangeName(true);
  };

  const closeChangeName = () => {
    setIsChangeName(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const user = localStorage.getItem('email');
  console.log(user);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/home`, { withCredentials: true })
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
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await HttpClient.post(`${import.meta.env.VITE_REACT_APP_API_URL}/profile`, {
          username: user,
        });
        setUserData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error fetching user data', { autoClose: 3000 });
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
      <NavBar isLogin={true} />
      <div className="flex flex-col items-center justify-center mt-12 w-full max-w-6xl mx-auto">
        <div className="px-6 py-6 min-w-full">
          <div className="flex items-center">
            <img
              className="h-24 w-24 rounded-full object-cover"
              src={generateAvatarUrl(userData.name)}
            />
            <div className='flex flex-col text-2xl px-12 font-light py-2'>
              <div className='flex '>
                <b className='font-semibold '>{userData.name}</b>
                <FaPen className='text-gray-500 ml-2 my-auto cursor-pointer border-b-2 hover:border-green-700 hover:text-green-700' onClick={openChangeName} />
                <ChangeNameModal isOpen={isChangeName} onClose={closeChangeName} />
              </div>

              <b className='font-normal text-base text-slate-700 pt-2'>{user}</b>
            </div>
          </div>
          <div className='flex justify-center mt-4'>
            <div className='flex flex-col w-40 mt-6 border-l-2 h-full'>
              <div
                className='flex items-center px-4 py-2  border-gray-300 cursor-pointer hover:bg-gray-200 hover:rounded-md'
                onClick={() => setShowProfile(true)}
              >
                <VscAccount />
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
                <div className="flex bg-white border-2 border-gray-200 rounded-xl overflow-hidden px-8 py-10 max-w-3xl w-full ml-6">
                  <div>
                    <h1 className="text-sm text-gray-600 p-6">Name: {userData.name}</h1>
                    <p className="text-sm text-gray-600 p-6">Email: {user}</p>
                    <p className="text-sm text-gray-600 p-6">Subscription: {getSubscriptionType(userData.subscription)}</p>
                    <p className="text-sm text-gray-600 p-6">Joined at: {new Date(userData.created_at).toLocaleString()}</p>
                  </div>
                  <div className='pt-6 pl-6 mx-6 border-l-2 h-min max-h-min'>
                    <p>Account</p>
                    <button className='font-light pt-4 font-mono border-b-2 border-white hover:border-green-700 hover:text-green-700' onClick={openModal}>
                      Change password
                    </button>
                    <ChangePasswordModal isOpen={isModalOpen} onClose={closeModal} />
                  </div>
                </div> :
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden px-8 py-10 max-w-3xl w-full ml-6">
                  <p className="text-sm text-gray-600 p-6">Current Plan: </p>
                  <p className='text-lg px-6'>{getSubscriptionType(userData.subscription)}</p>
                </div>
            }

          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default {
  routeProps: {
    path: "/profile",
    main: UserProfile,
  },
};
