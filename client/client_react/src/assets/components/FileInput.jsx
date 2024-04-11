// FileInput.js
import React, { useState } from 'react';
import { IoMdCloudUpload } from "react-icons/io";

const FileInput = ({ onChange }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    onChange(file);
  };

  return (
    <div className="cursor-pointer relative m-2 hover:bg-gray-200 rounded-full">
      <input
        type="file"
        className="absolute w-full h-full opacity-0"
        onChange={handleFileChange}
      />
      <div className="w-full h-full py-2 px-4 flex">
        {selectedFile ? (
          <p className="text-sm">{selectedFile.name}</p>
        ) : (
        
          <p className="text-sm text-gray-500 self-center flex items-center"> <IoMdCloudUpload className='mr-2 text-xl'/> Upload file</p>
        )}
      </div>
    </div>
  );
};

export default FileInput;
