
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

const FileUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div 
        id="dropZone"
        className={`drop-zone border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 drop-zone--over' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('csvFile')?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          {selectedFile ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div>
                <p className="drop-zone__prompt text-green-600 font-medium">
                  File Selected Successfully!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <span className="drop-zone__prompt text-gray-600 font-medium">
                  Drop CSV file here or click to upload
                </span>
                <p className="text-sm text-gray-500 mt-2">
                  Supports CSV files up to 10MB
                </p>
              </div>
            </>
          )}
        </div>
        
        <input 
          type="file" 
          id="csvFile" 
          className="drop-zone__input hidden" 
          accept=".csv"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};

export default FileUpload;
