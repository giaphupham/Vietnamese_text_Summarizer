import React, {useEffect, useState} from 'react';
import Footer from '../components/Footer';
import PlanWindow from '../components/PlanWindow';
import NavBar from '../components/NavBar';
import axios from 'axios';

const SubscriptionPage = () => {
  const [plans, setPlans] = useState(0);

  const user = localStorage.getItem('email');

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/profile', {
                username: user ,
            });
            setPlans(response.data.subscription);
            console.log(response.data.subscription);
            
        } catch (error) {
            console.error('Error fetching user data:', error);
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
            name: 'Free',
            price: '$0',
            pros: ['Unlimited access to all features', 'Free updates', '24/7 support'],
            cons: ['Limited to 1 user', 'No advanced features']
          }} />

          <PlanWindow plan={{
            plans: getSubscriptionType(plans) === 'Pro',
            name: 'Pro',
            price: '$20',
            pros: ['Unlimited access to all features', 'Free updates', '24/7 support', 'Advanced features'],
            cons: ['Limited to 5 users']
          }} />

          <PlanWindow plan={{
            plans: getSubscriptionType(plans) === 'Premium',
            name: 'Premium',
            price: '$50',
            pros: ['Unlimited access to all features', 'Free updates', '24/7 support', 'Advanced features', 'Unlimited users'],
            cons: ['No cons']
          }} />
      </div>

    </div>
          <Footer />
    </div>
  );
}

export default {
    routeProps: {
      path: "/premium",
      main: SubscriptionPage,
    },
  };
