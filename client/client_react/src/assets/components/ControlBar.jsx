import React, { useState } from 'react';


function ControlBar({theme, setSummarizeType}) {
  const [mode, setMode] = useState('short');

  const handleModeChange = (e) => {
    const newMode = e.target.value === '0' ? 'short' : 'long';
    setMode(newMode);
    setSummarizeType(newMode);
  };


  return (
    <div className={`flex ${theme} `} >
      <div className="w-full max-w-full py-2 px-4 flex items-center border-b-2">
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
      </div>
    </div>
  );
}

export default ControlBar;