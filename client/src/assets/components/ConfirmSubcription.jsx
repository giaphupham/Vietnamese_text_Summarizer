// ConfirmationModal.jsx
import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, remainingDays }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Confirm Plan Change</h2>
        {remainingDays !== null && (
          <p className="mb-4">You have {remainingDays} days remaining in your current plan.</p>
        )}
        <p className="mb-4">Are you sure you want to change your plan? This action cannot be undone.</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-full mr-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#178733] hover:bg-[#0B6722] text-white font-semibold py-2 px-4 rounded-full"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
