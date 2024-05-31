import React from "react";
import { useState, useEffect } from "react";
import InputAndOutput from "./InputAndOuput";
import ControlBar from "./ControlBar";
import axios from "axios";
import HttpClient from "./HttpClient";


function MainField() {
  const [summarizeType, setSummarizeType] = useState('short');
  const [showFeedback, setShowFeedback] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [numberSentences, setNumberSentences] = useState(0);

  const handleFeedbackClick = () => {
    setShowFeedback(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
  };

//   useEffect(() => {
//     HttpClient.get('http://127.0.0.1:5000/home', { withCredentials: true })
//         .then(response => {
//             if (response.status === 200) {
//                 console.log(response.data.message);
//             } else {
//                 throw new Error('You have to log in first');
//             }
//         })
//         .catch(error => {
//             console.error(error);
//             // Redirect to login page
//         });
// },[]);
  // useEffect(() => {
  //   // Fetch user login status from the backend or session
  //   axios.get('http://127.0.0.1:5000/status')
  //     .then(response => setLoggedIn(response.data.loggedIn))
  //     .catch(error => console.error(error));
  // }, []);

  return (
    <div className="flex flex-col max-w-6xl mx-auto mt-20 border rounded-xl shadow-md">
        <ControlBar setSummarizeType={setSummarizeType} onClick={handleFeedbackClick} setNumberSentences={setNumberSentences}/>
        <InputAndOutput summarizeType={summarizeType} showFeedback={showFeedback} Close={handleCloseFeedback} numberSentences={numberSentences}/>
       
      
    </div>
  );
}

export default MainField;