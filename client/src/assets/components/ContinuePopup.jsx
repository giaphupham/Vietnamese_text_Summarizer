import React from "react";


function ContinuePopUp({show, onClose}) {

    if (!show) return null;

    const [isModalOpen, setIsModalOpen] = useState(false);



    const close = () => {
        setIsModalOpen(false);
    };

    return (
<div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white py-8 rounded-3xl shadow-2xl max-w-xl mx-auto text-center transform transition-all duration-1000 ease-in-out">
        <div className="bg-popup-pattern p-6 rounded-t-3xl">
          <h2 className="text-3xl font-extrabold mb-4 text-[#178733]">🎉 Continue Using your plan 🎉</h2>
          <p className="mb-4 text-gray-700"> 
            You are reached the end day of your plan. To continue using our service, please pay for your plan or choose another plan.
          </p>
          
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-green-800 to-green-400 text-white px-6 py-3 rounded-full shadow-xl transform hover:scale-110 transition-transform duration-300 mr-4"
          >
            Pay Now
          </button>
            <button
              onClick={() => window.location.href = '/premium'}
              className="bg-gradient-to-r from-green-800 to-green-400 text-white px-6 py-3 rounded-full shadow-xl transform hover:scale-110 transition-transform duration-300 mr-4"
            >
              Choose Another Plan
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-3 rounded-full shadow-xl transform hover:scale-110 transition-transform duration-300"
          >
            Close
          </button>
          <PaymentPopUp isOpen={isModalOpen}  onClose={close} plan_id={plan_id} price_id={price} planName={planName} price={planPrice}/>
        </div>
      </div>
    </div>

  );
}

export default ContinuePopUp;