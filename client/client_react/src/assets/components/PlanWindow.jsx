import React, {useEffect, useState}from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import PaymentPopUp from './PaymentPopUp';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

// the key is located in the .env file
const stripePromise = loadStripe('pk_test_51PH03zRtjuoXgTndvOsbkwlA2KxaEXsvXPb7dMx849pchh9jo4ufF6kRAaOuwgpVyJvhh27Rumu1MXP3iZRq0rSF00c43yVrJG');



const PlanWindow = ({ plan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plan_id, setPlanId] = useState(0);

  const handleUpgrade = async (e) => {
    e.preventDefault();
    if(plan.id === 0) {
      console.log('Free plan selected');
      console.log(plan.id);
      sendUpgradeRequest(plan.id);
    }
    else{
      console.log('Pro plan selected');
      setPlanId(plan.id)
      //navigate('/payment');
      setIsModalOpen(true)
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/profile', {
                withCredentials: true,
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    fetchUserData();
  }, []);

  const close = () => {
    setIsModalOpen(false);
  };

  const sendUpgradeRequest = async (selectedPlan) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/upgrade', { plan: selectedPlan, user: localStorage.getItem('email')});

      if (response.status === 200) {
        console.log('Upgrade request sent successfully');
        // You can add further actions here if needed
      } else {
        console.error('Failed to send upgrade request');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="p-6 border border-[#178733] rounded-lg shadow-lg bg-white mx-4">
        <h2 className="text-xl font-semibold text-center mb-2">{plan.name}</h2>
        {plan.plans  ? (
          <button className="w-full my-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-full" disabled>Current Plan</button>
            ) : (
          <button className="w-full my-2 bg-[#178733] hover:bg-[#0B6722] text-white font-semibold py-2 px-4 rounded-full" onClick={handleUpgrade}>Upgrade</button>
            )
            }
          <PaymentPopUp isOpen={isModalOpen}  onClose={close} plan_id={plan_id}/>
        
        <div className="plan-details">
          <p><strong>Price:</strong> {plan.price}</p>
          <p><strong>Pros:</strong></p>
          <ul className="list-disc list-inside">
            {plan.pros.map((pro, index) => <li key={index}>{pro}</li>)}
          </ul>
          <p><strong>Cons:</strong></p>
          <ul className="list-disc list-inside">
            {plan.cons.map((con, index) => <li key={index}>{con}</li>)}
          </ul>
        </div>
      </div>
    </Elements>
  );
}

export default PlanWindow;