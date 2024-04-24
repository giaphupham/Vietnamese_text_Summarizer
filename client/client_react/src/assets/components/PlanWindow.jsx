import React, {useEffect, useState}from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';


const PlanWindow = ({ plan }) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(0);

  const handleUpgrade = async (e) => {
    e.preventDefault();
    if(plan.id === 0) {
      console.log('Free plan selected');
      console.log(plan.id);
      sendUpgradeRequest(plan.id);
    }
    else{
      console.log('Pro plan selected');
      //navigate('/payment');
    }
  }

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
    <div className="p-6 border border-[#178733] rounded-lg shadow-lg bg-white mx-4">
      <h2 className="text-xl font-semibold text-center mb-2">{plan.name}</h2>
      {plan.plans  ? (
        <button className="w-full my-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-full" disabled>Current Plan</button>
          ) : (
        <button className="w-full my-2 bg-[#178733] hover:bg-[#0B6722] text-white font-semibold py-2 px-4 rounded-full" onClick={handleUpgrade}>Upgrade</button>
          )}
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
  );
}

export default PlanWindow;