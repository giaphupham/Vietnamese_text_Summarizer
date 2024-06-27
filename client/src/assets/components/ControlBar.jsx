import React, { useState } from 'react';
import { MdOutlineFeedback } from "react-icons/md";


function ControlBar({theme, setSummarizeType, onClick, setNumberSentences}) {
  // const [mode, setMode] = useState('short');
  const [numberSentences, setNumberSentence] = useState(0);

  // const handleModeChange = (e) => {
  //   const newMode = e.target.value === '0' ? 'short' : 'long';
  //   setMode(newMode);
  //   setSummarizeType(newMode);
  // };

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
          <div className="relative group">
            <div className="flex items-center justify-center mt-1.5 ml-2 w-4 h-4 border-2 border-black rounded-full text-xs text-black cursor-pointer">
              !
            </div>
            <div className="absolute left-1/2 transform -translate-y-40 translate-x-4 mt-2 w-96 p-2 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Your input sentence will be summarized to the number of sentences you specify. If you want to summarize the whole text, please set the number of sentences to 0. Don't set the number of sentences to more than 10 and more than half of the sentences in the input text.
            </div>
          </div>
        </div>
        <div className='text-xl self-end hover:bg-gray-200 p-2 rounded-full cursor-pointer' onClick={onClick}>
          <MdOutlineFeedback />
        </div>
      </div>

    </div>
  );
}

export default ControlBar;