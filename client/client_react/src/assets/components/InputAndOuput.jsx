import React, { useState, useRef, useEffect } from 'react';
import FileInput from './FileInput';
import axios from 'axios';
import copy from 'clipboard-copy';
import { FaRegCopy } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";
import Notification from './NotiWindow';
import { IoMdCloudDownload } from "react-icons/io";
import HttpClient from './HttpClient';
import FeedbackWindow from "./FeedbackWindow";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpgradePopUp from './UpgradePopUp';

const InputAndOutput = ({summarizeType, showFeedback, Close, numberSentences}) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentences, setSentences] = useState(0);
  const [words, setWords] = useState(0);
  const [maxWords, setMaxWords] = useState(1500);
  const textAreaRef = useRef();
  const [loggedIn, setLoggedIn] = useState(false); // Check user login status
  const maxFreeSummaries = 3;
  const [summaryCount, setSummaryCount] = useState(0);
  const [showPlan, setShowPlan] = useState(false);
  const [score, setScore] = useState(0);

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

  const countSentences = () => {
    // Split text into sentences based on period, exclamation mark, or question mark
    const sentences = inputText.split(/[.!?]+/);
    // Filter out empty strings (e.g., consecutive punctuation marks)
    const filteredSentences = sentences.filter(sentence => sentence.trim() !== '');
    return filteredSentences.length;
  };

  const countWords = () => {
    const words = inputText.split(/\s+/); // split by spaces
    return words.filter(word => word.trim() !== '').length; // filter out empty strings
  };
  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const isTextareaEmpty = () => {
    return inputText.trim() === '';
  };

  useEffect(() => {
    // Fetch user login status from the backend or session
    HttpClient.get(`${import.meta.env.VITE_REACT_APP_URL}/status`)
      .then(response => setLoggedIn(response.data['loggedIn']))
      .catch(error => console.error(error));
  }, []);

  const handleSummarize = async () => {
      if (!loggedIn && summaryCount >= maxFreeSummaries) {
        toast.error('You have reached the maximum number of free summaries. Please log in to continue.', {autoClose: 3000});
        return;
      }
      console.log(inputText + ' ' + numberSentences);

      //const apiUrl = summarizeType === 'short' ? `${import.meta.env.VITE_REACT_APP_URL}/summarize-short` : `${import.meta.env.VITE_REACT_APP_URL}/summarize-long`;
      const apiUrl = `${import.meta.env.VITE_REACT_APP_URL}/summarize`;
      setLoading(true);
      await HttpClient.post(apiUrl, {
        'input-text': inputText,
        'sentences': numberSentences,
        withCredentials: true,
      })
      .then(response => {
        setLoading(false);
        const data = response.data;
        setOutputText(data['output-text']);
        setSentences(data['sentences']);
        setWords(data['words']);
        setMaxWords(data['max-words']);
        setSummaryCount(prevCount => prevCount + 1);
        setScore(data['score']);
      })
      .catch(error => {
        //console.log('catch ' + error.response.data.error)
        toast.error(error.response.data.error, {autoClose: 3000});
        setLoading(false);
        if (error.response.status === 403) {
          setShowPlan(true);
        }
      });

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
          {isTextareaEmpty() ? (
            <FileInput />
          ) : (<p className='p-4'>{countWords()} words / {maxWords} words</p>
          )}
          <button
          className="bg-[#178733] hover:bg-[#0B6722] text-white font-bold py-2 px-4 rounded-full my-2 mx-6 w-40"
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
          className="text-black font-medium py-2 px-2 rounded m-2"
          >
            {sentences} sentences | {words} words | Score: {score}%
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
      {showFeedback && <FeedbackWindow onClose={Close} />}
      <UpgradePopUp show={showPlan} onClose={() => setShowPlan(false)} />
      <ToastContainer />
    </div>
  );
};

export default InputAndOutput;
