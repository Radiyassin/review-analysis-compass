
import React, { useState, useRef } from 'react';
import { Upload, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    console.log('FileUpload: File selected:', file.name, 'Size:', file.size);
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    
    // Store file globally for main.js access - this is crucial!
    (window as any).selectedCsvFile = file;
    console.log('FileUpload: File stored globally as window.selectedCsvFile');
    
    // Call callback if provided
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center gap-4">
          {selectedFile ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div>
                <p className="text-green-600 font-medium">
                  File Selected Successfully!
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Click "Analyze CSV" button to start analysis
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <span className="text-gray-600 font-medium">
                  Drop CSV file here or click to upload
                </span>
                <p className="text-sm text-gray-500 mt-2">
                  Supports CSV files up to 10MB
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  File must contain a 'Reviews' column
                </p>
              </div>
            </>
          )}
        </div>
        
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept=".csv"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};

export default FileUpload;
