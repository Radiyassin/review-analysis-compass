
import React from 'react';

const IntroGif = () => {
  return (
    <div 
      id="intro-gif" 
      className="fixed top-0 left-0 w-screen h-screen bg-white flex items-center justify-center z-[9999]"
    >
      <img 
        src="/images/intro.gif" 
        alt="Loading..." 
        className="max-w-full h-auto transform scale-150 bg-white"
      />
    </div>
  );
};

export default IntroGif;
