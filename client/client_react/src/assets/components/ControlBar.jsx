import React, { useState } from 'react';
import { MdOutlineFeedback } from "react-icons/md";


function ControlBar({theme, setSummarizeType, onClick, setNumberSentences}) {
  const [mode, setMode] = useState('short');
  const [numberSentences, setNumberSentence] = useState(0);

  const handleModeChange = (e) => {
    const newMode = e.target.value === '0' ? 'short' : 'long';
    setMode(newMode);
    setSummarizeType(newMode);
  };

  const handleNumberSentencesChange = (e) => {
    console.log(e.target.value);
    const NewnumberSentences = e.target.value;
    setNumberSentence(NewnumberSentences);
    setNumberSentences(NewnumberSentences);
    
  };


  return (
    <div className={`flex ${theme} `} >
      <div className="w-full max-w-full py-2 px-4 flex items-center border-b-2 justify-between">
        {/* <div className='flex'>
          <label className="block text-lg font-bold mr-2" htmlFor="mode">
            Mode:
          </label>
          <div className='flex items-center'>
              <p>
                  Short
              </p>
              <input
              type="range"
              min="0"
              max="1"
              step="1"
              value={mode === 'short' ? '0' : '1'}
              id="mode"
              onChange={handleModeChange}
              className="accent-[#178733]  w-3/12 mx-1 "
              />
              <p>
                  Long
              </p>
          </div>
        </div> */}
        <div className='flex item-center'>
          <label className="block text-lg font-bold mr-2" htmlFor="numberSentences">
            Number of Sentences:
          </label>
          <input
            type="number"
            id="numberSentences"
            name="numberSentences"
            min="0"
            max="10"
            value={numberSentences}
            onChange={handleNumberSentencesChange}
            className="accent-[#178733] w-14 mx-1 border-2 px-2 rounded-md"
          />
        </div>
        <div className='text-xl self-end hover:bg-gray-200 p-2 rounded-full cursor-pointer' onClick={onClick}>
          <MdOutlineFeedback />
        </div>
      </div>

    </div>
  );
}

export default ControlBar;