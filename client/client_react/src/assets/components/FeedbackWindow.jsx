import React, { useState } from 'react';
import ReactStars from "react-rating-stars-component";
import axios from 'axios';

const FeedbackWindow = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const ratingChanged = (newRating) => {
    setRating(newRating);
    console.log(rating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://127.0.0.1:5000/feedback', {
      
      'comment': feedback,
      'star': rating,
    }).then(response => {
      console.log(response.data);
      onClose();
    }).catch(error => {
      console.log(error);
    });


  };




  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end mt-[54px]">
      <div className="bg-white  p-8 w-96 h-full max-h-full overflow-y-auto shadow-lg transform translate-x-0 transition-transform ease-in-out duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Feedback</h2>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-32 border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-0 resize-none"
            placeholder="Write your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>
          <div className="mb-4">
            <p className="text-sm mb-2">Rate by star:</p>
            <div className="flex items-center">
              <ReactStars
                count={5}
                onChange={ratingChanged}
                size={24}
                activeColor="#ffd700"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 text-gray-600 rounded-full border border-gray-300 hover:bg-gray-100"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-full bg-[#178733] hover:bg-[#0B6722]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackWindow;