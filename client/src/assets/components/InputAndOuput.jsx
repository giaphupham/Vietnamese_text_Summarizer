import React, { useState, useRef, useEffect } from 'react';
import FileInput from './FileInput';
import copy from 'clipboard-copy';
import { FaRegCopy } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoMdCloudDownload } from "react-icons/io";
import HttpClient from './HttpClient';
import FeedbackWindow from "./FeedbackWindow";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpgradePopUp from './UpgradePopUp';

const InputAndOutput = ({showFeedback, Close, numberSentences}) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentences, setSentences] = useState(0);
  const [words, setWords] = useState(0);
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
        toast.success('Text copied to clipboard!', {autoClose: 3000});
      } else {
        toast.error('No text to copy!', {autoClose: 3000});
      }
    }
  };

  const countSentences = () => {
    // Split text into sentences based on period, exclamation mark, or question mark
    const sentences = inputText.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s/g);
    // Filter out empty strings (e.g., consecutive punctuation marks)
    const filteredSentences = sentences.filter(sentence => sentence.trim() !== '');
    return filteredSentences.length;
  };

  const countWords = () => {
    const maxWords = useMaxWords();
    const words = inputText.split(/\s+/); // split by spaces
    const wordsCount = words.filter(word => word.trim() !== '').length; // filter out empty strings
    if (wordsCount > maxWords) {
      toast.warn(`You have exceeded the maximum word limit of ${maxWords} words.`);
    }

    return wordsCount;
  };

  
  const useMaxWords = () => {
    const [maxWords, setMaxWords] = useState(700);
    useEffect(() => {
      const subscription = localStorage.getItem('subscription');
      if (subscription === '0') {
        setMaxWords(1500);
      } else if (subscription === '1') {
        setMaxWords(3000);
      } else if (subscription === '2') {
        setMaxWords(10000);
      }
    }, []); // Empty dependency array means this effect runs once on mount
  
    return maxWords;
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  // const isTextareaEmpty = () => {
  //   return inputText.trim() === '';
  // };

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
        setSummaryCount(prevCount => prevCount + 1);
        setScore(data['score']);
        if (data['message'] != ''){
            toast.error(data['message'], {autoClose: 3000})
        }
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

  return (
    <div className="md:h-96 flex md:flex-row flex-nowrap divide-x divide-slate-200 flex-col">
      <div className="flex-1">
        <textarea
          className="w-full h-64 md:h-5/6 p-4 focus:outline-none focus:ring-0 resize-none "
          type='text'
          value={inputText}
          placeholder='Enter or paste your text and press &quot;Summarize.&quot;'
          onChange={handleInputChange}
        />
        <div className='flex justify-between'>
            <p className='p-4'>{countWords()} words / {useMaxWords()} words | {countSentences()} sentences</p>
          <button
          className="bg-[#178733] hover:bg-[#0B6722] text-white font-bold py-2 px-4 rounded-full my-2 mx-6 w-40"
          onClick={handleSummarize}
          disabled={loading}
          >
            {loading ? (
            <div
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
            >
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
          className="w-full h-64 md:h-5/6 p-4 focus:outline-none focus:ring-0 resize-none "
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
