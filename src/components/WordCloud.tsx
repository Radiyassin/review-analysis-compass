
import React, { useEffect, useRef, useState } from 'react';

interface WordCloudData {
  text: string;
  value: number;
}

const WordCloud = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wordData, setWordData] = useState<WordCloudData[]>([]);

  useEffect(() => {
    console.log('☁️ WordCloud: Component mounted, checking for data...');
    
    if (!window.dataStore) {
      console.log('☁️ WordCloud: DataStore not available yet');
      return;
    }

    // Get initial data
    const initialPhrases = window.dataStore.getData('commonPhrases');
    if (initialPhrases && Array.isArray(initialPhrases)) {
      console.log('☁️ WordCloud: Found initial phrases:', initialPhrases);
      const formattedData = initialPhrases.slice(0, 20).map((phrase: any, index: number) => {
        if (Array.isArray(phrase) && phrase.length >= 2) {
          return {
            text: String(phrase[0]),
            value: Number(phrase[1])
          };
        }
        return {
          text: typeof phrase === 'string' ? phrase : phrase.phrase || phrase.text || `Word ${index}`,
          value: typeof phrase === 'object' && phrase.count ? phrase.count : Math.random() * 50 + 10
        };
      });
      setWordData(formattedData);
    }

    // Subscribe to updates
    const unsubscribe = window.dataStore.subscribe((key: string, value: any) => {
      if (key === 'commonPhrases' && value && Array.isArray(value)) {
        console.log('☁️ WordCloud: Received new phrases:', value);
        const formattedData = value.slice(0, 20).map((phrase: any, index: number) => {
          if (Array.isArray(phrase) && phrase.length >= 2) {
            return {
              text: String(phrase[0]),
              value: Number(phrase[1])
            };
          }
          return {
            text: typeof phrase === 'string' ? phrase : phrase.phrase || phrase.text || `Word ${index}`,
            value: typeof phrase === 'object' && phrase.count ? phrase.count : Math.random() * 50 + 10
          };
        });
        setWordData(formattedData);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!wordData.length || !containerRef.current) return;

    console.log('☁️ WordCloud: Rendering word cloud with data:', wordData);
    
    const container = containerRef.current;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create words as divs with absolute positioning
    const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-red-600', 'text-yellow-600', 'text-pink-600'];
    
    wordData.forEach((word, index) => {
      const wordElement = document.createElement('div');
      wordElement.textContent = word.text;
      wordElement.className = `absolute cursor-pointer transition-all duration-300 hover:scale-125 font-black ${colors[index % colors.length]} drop-shadow-lg`;
      
      // Calculate much larger font size based on value
      const fontSize = Math.max(24, Math.min(64, word.value * 4));
      wordElement.style.fontSize = `${fontSize}px`;
      wordElement.style.fontWeight = '900';
      wordElement.style.textShadow = '3px 3px 6px rgba(0,0,0,0.4)';
      wordElement.style.letterSpacing = '1px';
      
      // Position in a wider spiral pattern with more spacing
      const angle = index * 1.2; // Increased angle for more spread
      const radius = Math.sqrt(index) * 45; // Increased radius for more spacing
      const centerX = 50; // percentage
      const centerY = 50; // percentage
      
      const x = centerX + Math.cos(angle) * (radius / 8);
      const y = centerY + Math.sin(angle) * (radius / 8);
      
      // Ensure words don't overlap by adding more boundary space
      wordElement.style.left = `${Math.max(8, Math.min(82, x))}%`;
      wordElement.style.top = `${Math.max(15, Math.min(75, y))}%`;
      wordElement.style.transform = 'translate(-50%, -50%)';
      
      // Random rotation with less extreme angles
      const rotation = (Math.random() - 0.5) * 20;
      wordElement.style.transform += ` rotate(${rotation}deg)`;
      
      container.appendChild(wordElement);
    });
  }, [wordData]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-[500px] border-2 border-gray-300 rounded-xl bg-gradient-to-br from-white to-gray-50 relative overflow-hidden flex items-center justify-center shadow-inner"
    >
      {wordData.length === 0 && (
        <p className="text-gray-500 absolute font-semibold">Word cloud will appear here after analysis</p>
      )}
    </div>
  );
};

export default WordCloud;
