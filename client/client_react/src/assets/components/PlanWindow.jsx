import React from "react";


const PlanWindow = ({ plan }) => {
  return (
    <div className="p-6 border border-[#178733] rounded-lg shadow-lg bg-white mx-4">
      <h2 className="text-xl font-semibold text-center mb-2">{plan.name}</h2>
      {plan.plans  ? (
        <button className="w-full my-2 bg-gray-500 text-white font-semibold py-2 px-4 rounded-full" disabled>Current Plan</button>
          ) : (
        <button className="w-full my-2 bg-[#178733] hover:bg-[#0B6722] text-white font-semibold py-2 px-4 rounded-full">Upgrade</button>
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