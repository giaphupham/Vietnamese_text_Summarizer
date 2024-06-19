import React from 'react';

const Modal = ({ isOpen, onClose, onConfirm, errorMessage,setPassword }) => {
  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Input Your Password</h2>
            <div className="mb-4">
              <input
                type="password"
                className="border py-2 px-4 w-full"
                placeholder="Your Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
            <div className="flex justify-end">
              <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 mr-2 rounded">
                Cancel
              </button>
              <button onClick={onConfirm} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
