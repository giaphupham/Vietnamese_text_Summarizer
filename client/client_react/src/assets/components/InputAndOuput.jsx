import React, { useState, useRef } from 'react';
import FileInput from './FileInput';
import axios from 'axios';
import copy from 'clipboard-copy';
import { FaRegCopy } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";
import Notification from './NotiWindow';
import { IoMdCloudDownload } from "react-icons/io";

const InputAndOutput = ({summarizeType}) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const textAreaRef = useRef();

  const handleCopyClick = () => {
    if (textAreaRef.current) {
      const textToCopy = textAreaRef.current.value;
      
      if (textToCopy) {
        copy(textToCopy);
        setShowNotification(true);
        // Automatically close the notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      } else {
        setShowNotification(true);
      }
    }
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSummarize = async () => {
      const apiUrl = summarizeType === 'short' ? 'http://127.0.0.1:5000/summarize-short' : 'http://127.0.0.1:5000/summarize-long';

      try{
        setLoading(true);
        const response = await axios.post(apiUrl, {
          'input-text': inputText
        });

        const data = response.data;
        setOutputText(data['output-text']);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }

  };

  const handleClearClick = () => {  
    setInputText('');
    setOutputText('');
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'downloaded_text.txt';

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  // const handleFileUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       setInputText(event.target.result);
  //     };
  //     reader.readAsText(file);
  //   }
  // };


  return (
    <div className="h-96 flex flex-row flex-nowrap divide-x divide-slate-200 ">
      <div className="flex-1">
        <textarea
          className="w-full h-5/6 p-4 focus:outline-none focus:ring-0 resize-none "
          type='text'
          value={inputText}
          placeholder='Enter or paste your text and press &quot;Summarize.&quot;'
          onChange={handleInputChange}
        />
        <div className='flex justify-between'>
          <FileInput />
          <button
          className="bg-[#178733] hover:bg-[#0B6722] text-white font-bold py-2 px-4 rounded-full m-2 w-40"
          onClick={handleSummarize}
          disabled={loading}
          >
            {loading ? (
            <div
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status">
            </div>
            ) : (
              'Summarize'
            )}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <textarea
          ref={textAreaRef}
          className="w-full h-5/6 p-4 focus:outline-none focus:ring-0 resize-none "
          value={outputText}
          readOnly
        />
        <div>
        <div className='flex justify-between items-center'>
          <div
          className="text-black font-medium py-2 px-4 rounded m-2"
          >
          sentences: 0 
          </div>
          <div className='mx-4 self-center flex items-center'>
          <button
            onClick={handleCopyClick}
            className="text-black rounded-full hover:bg-gray-200 p-2"
          >
            <FaRegCopy />
          </button>
          {showNotification && (
            <Notification
              message={
                outputText
                  ? 'Text copied to clipboard!'
                  : 'No text to copy!'
              }
              onClose={handleNotificationClose}
            />
          )}
          <div className="mx-2">
            <button
            className='hover:bg-gray-200 p-2 rounded-full'
            onClick={handleClearClick}
            >
              <FaRegTrashAlt />
            </button>
          </div>
          <div>
            <button
            className='hover:bg-gray-200 p-2 rounded-full'
            onClick={handleDownload}>
              <IoMdCloudDownload className='text-lg'/>
            </button>
          </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default InputAndOutput;
