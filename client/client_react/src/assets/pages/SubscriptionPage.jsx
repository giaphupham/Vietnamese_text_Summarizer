import React, {useEffect, useState} from 'react';
import Footer from '../components/Footer';
import PlanWindow from '../components/PlanWindow';
import NavBar from '../components/NavBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import HttpClient from '../components/HttpClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const SubscriptionPage = () => {
  const [plans, setPlans] = useState(0);
  const navigate = useNavigate();

  const user = localStorage.getItem('email');

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
  },[]);

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await HttpClient.post(`${import.meta.env.VITE_REACT_APP_API_URL}/profile`, {
                username: user ,
            });
            setPlans(response.data.subscription);
            console.log(response.data.subscription);
            
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Error fetching user data', {autoClose: 3000});
        }
    };

    fetchUserData();
  }, []);


  const getSubscriptionType = (type) => {
    switch (type) {
        case 0:
            return 'Free';
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
      <NavBar />
      <h1 className="text-4xl text-center font-bold mt-4 text-[#178733]">Choose a plan</h1>
    <div className="flex justify-center items-center my-16">
      <div className="flex justify-between">
          <PlanWindow plan={{
            plans: getSubscriptionType(plans) === 'Free',
            id:0,
            name: 'Free',
            price: '$0',
            pros: ['Unlimited access to all features', 'Free updates', '24/7 support'],
            cons: ['Limited to 1 user', 'No advanced features']
          }} />

          <PlanWindow plan={{
            plans: getSubscriptionType(plans) === 'Pro',
            id:1,
            name: 'Pro',
            price: '$0.99',
            pros: ['Unlimited access to all features', 'Free updates', '24/7 support', 'Advanced features'],
            cons: ['Limited to 5 users'],
            price_id:'price_1PH4H2RtjuoXgTndyQUnP94v'
          }} />

          <PlanWindow plan={{
            plans: getSubscriptionType(plans) === 'Premium',
            id:2,
            name: 'Premium',
            price: '$9.99',
            pros: ['Unlimited access to all features', 'Free updates', '24/7 support', 'Advanced features', 'Unlimited users'],
            cons: ['No cons'],
            price_id:'price_1PHGgsRtjuoXgTndlp1SRwHQ'
          }} />
      </div>

    </div>
          <Footer />
          <ToastContainer />
    </div>
  );
}

export default {
    routeProps: {
      path: "/premium",
      main: SubscriptionPage,
    },
  };
