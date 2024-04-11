// src/components/Notification.js
import React from 'react';
import PropTypes from 'prop-types';
import { IoMdClose } from "react-icons/io";

const Notification = ({ message, onClose }) => {
  return (
    <div className="fixed bottom-10 left-10 m-4 p-2 bg-slate-800 text-white rounded-md flex items-center">
      <p className='m-2'>{message}</p>
      <button onClick={onClose} className="rounded-md p-1">
        <IoMdClose />
      </button>
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Notification;
