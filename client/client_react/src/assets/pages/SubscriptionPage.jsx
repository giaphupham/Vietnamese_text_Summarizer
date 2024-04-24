import React from 'react';
import Footer from '../components/Footer';

const SubscriptionPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex justify-between w-full max-w-lg">
        <div className="w-1/2 p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
          <h2 className="text-xl font-semibold text-center mb-4">Free Plan</h2>
          <div className="plan-details">
            <p><strong>Price:</strong> $0/month</p>
            <p><strong>Pros:</strong></p>
            <ul className="list-disc list-inside">
              <li>Basic features</li>
              <li>No cost</li>
            </ul>
            <p><strong>Cons:</strong></p>
            <ul className="list-disc list-inside">
              <li>Limited features</li>
              <li>No customer support</li>
            </ul>
          </div>
          <button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">Upgrade</button>
        </div>

        <div className="w-1/2 p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
          <h2 className="text-xl font-semibold text-center mb-4">Premium Plan</h2>
          <div className="plan-details">
            <p><strong>Price:</strong> $9.99/month</p>
            <p><strong>Pros:</strong></p>
            <ul className="list-disc list-inside">
              <li>Full access to all features</li>
              <li>Priority customer support</li>
            </ul>
            <p><strong>Cons:</strong></p>
            <ul className="list-disc list-inside">
              <li>Costs $9.99/month</li>
            </ul>
          </div>
          <button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">Upgrade</button>
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
