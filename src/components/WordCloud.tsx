
import React, { useEffect } from 'react';

const WordCloud = () => {
  useEffect(() => {
    // Initialize word cloud when component mounts
    // This will integrate with your existing D3.js word cloud code
  }, []);

  return (
    <div 
      id="wordCloud" 
      className="w-full h-96 border border-gray-200 rounded-lg bg-white flex items-center justify-center text-gray-500"
    >
      <p>Word cloud will appear here after analysis</p>
    </div>
  );
};

export default WordCloud;
