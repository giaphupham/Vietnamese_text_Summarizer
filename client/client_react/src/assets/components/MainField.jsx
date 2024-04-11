import React from "react";
import { useState } from "react";
import InputAndOutput from "./InputAndOuput";
import ControlBar from "./ControlBar";

function MainField() {
  const [summarizeType, setSummarizeType] = useState('short');

  return (
    <div className="flex flex-col max-w-6xl mx-auto mt-20 border rounded-xl shadow-md">
        <ControlBar setSummarizeType={setSummarizeType}/>
        <InputAndOutput summarizeType={summarizeType}/>
      
    </div>
  );
}

export default MainField;