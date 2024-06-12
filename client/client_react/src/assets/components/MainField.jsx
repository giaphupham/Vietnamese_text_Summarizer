import React from "react";
import { useState } from "react";
import InputAndOutput from "./InputAndOuput";
import ControlBar from "./ControlBar";


function MainField() {
  const [showFeedback, setShowFeedback] = useState(false);

  const [numberSentences, setNumberSentences] = useState(0);

  const handleFeedbackClick = () => {
    setShowFeedback(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
  };



  return (
    <div className="flex flex-col max-w-6xl mx-auto mt-20 border rounded-xl shadow-md">
        <ControlBar onClick={handleFeedbackClick} setNumberSentences={setNumberSentences}/>
        <InputAndOutput  showFeedback={showFeedback} Close={handleCloseFeedback} numberSentences={numberSentences}/>
       
      
    </div>
  );
}

export default MainField;