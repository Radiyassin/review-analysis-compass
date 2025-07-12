
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
      
      // Calculate font size based on value - made bigger
      const fontSize = Math.max(16, Math.min(42, word.value * 2.5));
      wordElement.style.fontSize = `${fontSize}px`;
      wordElement.style.fontWeight = '900';
      wordElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
      
      // Position in a spiral pattern
      const angle = index * 0.8;
      const radius = Math.sqrt(index) * 25;
      const centerX = 50; // percentage
      const centerY = 50; // percentage
      
      const x = centerX + Math.cos(angle) * (radius / 10);
      const y = centerY + Math.sin(angle) * (radius / 10);
      
      wordElement.style.left = `${Math.max(5, Math.min(85, x))}%`;
      wordElement.style.top = `${Math.max(10, Math.min(80, y))}%`;
      wordElement.style.transform = 'translate(-50%, -50%)';
      
      // Random rotation
      const rotation = (Math.random() - 0.5) * 30;
      wordElement.style.transform += ` rotate(${rotation}deg)`;
      
      container.appendChild(wordElement);
    });
  }, [wordData]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-96 border-2 border-gray-300 rounded-xl bg-gradient-to-br from-white to-gray-50 relative overflow-hidden flex items-center justify-center shadow-inner"
    >
      {wordData.length === 0 && (
        <p className="text-gray-500 absolute font-semibold">Word cloud will appear here after analysis</p>
      )}
    </div>
  );
};

export default WordCloud;
