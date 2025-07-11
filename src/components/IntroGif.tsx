
import React from 'react';

const IntroGif = () => {
  return (
    <div 
      id="intro-gif" 
      className="fixed inset-0 w-screen h-screen bg-white flex items-center justify-center z-50"
    >
      <img 
        src="/images/intro.gif" 
        alt="Loading..." 
        className="max-w-full h-auto transform scale-150"
      />
    </div>
  );
};

export default IntroGif;
