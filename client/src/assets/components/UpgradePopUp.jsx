import React from "react";


function UpgradePopUp({show, onClose}) {

    if (!show) return null;

    return (
<div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white py-8 rounded-3xl shadow-2xl max-w-xl mx-auto text-center transform transition-all duration-1000 ease-in-out">
        <div className="bg-popup-pattern p-6 rounded-t-3xl">
          <h2 className="text-3xl font-extrabold mb-4 text-[#178733]">🎉 Special Offer Just for You! 🎉</h2>
          <p className="mb-4 text-gray-700"> 
            You are reached the limit of your version. To continue using our service, please upgrade your plan or wait until the next day to reset the limit.
          </p>
          <p className="mb-4 text-gray-700">
            We have an exclusive offer to help you get the most out of our services. Subscribe now and enjoy all the amazing features we have in store for you!
          </p>
          
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={() => window.location.href = '/premium'}
            className="bg-gradient-to-r from-green-800 to-green-400 text-white px-6 py-3 rounded-full shadow-xl transform hover:scale-110 transition-transform duration-300 mr-4"
          >
            Subscribe Now
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-3 rounded-full shadow-xl transform hover:scale-110 transition-transform duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>

  );
}

export default UpgradePopUp;