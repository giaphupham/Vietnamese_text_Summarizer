import React from "react";
import { useState, useEffect } from "react";
import InputAndOutput from "./InputAndOuput";
import ControlBar from "./ControlBar";
import axios from "axios";

function MainField() {
  const [summarizeType, setSummarizeType] = useState('short');

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/home', { withCredentials: true })
        .then(response => {
            if (response.status === 200) {
                console.log(response.data.message);
            } else {
                throw new Error('You have to log in first');
            }
        })
        .catch(error => {
            console.error(error);
            // Redirect to login page
        });
},[]);
  return (
    <div className="flex flex-col max-w-6xl mx-auto mt-20 border rounded-xl shadow-md">
        <ControlBar setSummarizeType={setSummarizeType}/>
        <InputAndOutput summarizeType={summarizeType}/>
      
    </div>
  );
}

export default MainField;