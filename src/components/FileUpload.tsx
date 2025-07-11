
import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

const FileUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Initialize the drag and drop functionality from main.js when component mounts
  useEffect(() => {
    // This ensures the main.js file upload logic is initialized
    const script = document.createElement('script');
    script.innerHTML = `
      document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
        const dropZoneElement = inputElement.closest(".drop-zone");
        if (!dropZoneElement.hasAttribute('data-initialized')) {
          dropZoneElement.setAttribute('data-initialized', 'true');
          
          dropZoneElement.addEventListener("click", () => inputElement.click());

          inputElement.addEventListener("change", () => {
            if (inputElement.files.length) {
              updateThumbnail(dropZoneElement, inputElement.files[0]);
            }
          });

          dropZoneElement.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZoneElement.classList.add("drop-zone--over");
          });

          ["dragleave", "dragend", "drop"].forEach((type) => {
            dropZoneElement.addEventListener(type, () => {
              dropZoneElement.classList.remove("drop-zone--over");
            });
          });

          dropZoneElement.addEventListener("drop", (e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) {
              inputElement.files = e.dataTransfer.files;
              updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            }
          });
        }
      });

      function updateThumbnail(dropZoneElement, file) {
        let thumb = dropZoneElement.querySelector(".drop-zone__thumb");
        if (!thumb) {
          thumb = document.createElement("div");
          thumb.classList.add("drop-zone__thumb");
          dropZoneElement.appendChild(thumb);
        }
        thumb.textContent = \`Selected file: \${file.name}\`;
      }
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

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
