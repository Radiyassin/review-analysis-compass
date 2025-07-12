
import React, { useEffect, useRef, useState } from 'react';

interface WordCloudData {
  text: string;
  value: number;
}

const WordCloud = () => {
  const svgRef = useRef<SVGSVGElement>(null);
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
      const formattedData = initialPhrases.map((phrase: any, index: number) => ({
        text: typeof phrase === 'string' ? phrase : phrase.phrase || phrase.text || `Word ${index}`,
        value: typeof phrase === 'object' && phrase.count ? phrase.count : Math.random() * 50 + 10
      }));
      setWordData(formattedData);
    }

    // Subscribe to updates
    const unsubscribe = window.dataStore.subscribe((key: string, value: any) => {
      if (key === 'commonPhrases' && value && Array.isArray(value)) {
        console.log('☁️ WordCloud: Received new phrases:', value);
        const formattedData = value.map((phrase: any, index: number) => ({
          text: typeof phrase === 'string' ? phrase : phrase.phrase || phrase.text || `Word ${index}`,
          value: typeof phrase === 'object' && phrase.count ? phrase.count : Math.random() * 50 + 10
        }));
        setWordData(formattedData);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!wordData.length || !svgRef.current) return;

    console.log('☁️ WordCloud: Rendering word cloud with data:', wordData);
    
    const svg = svgRef.current;
    const container = svg.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = 384; // h-96 equivalent
    
    // Clear previous content
    svg.innerHTML = '';
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    // Simple word cloud layout
    const centerX = width / 2;
    const centerY = height / 2;
    const maxFontSize = 32;
    const minFontSize = 12;
    
    // Sort by value to place larger words first
    const sortedWords = [...wordData].sort((a, b) => b.value - a.value);
    
    sortedWords.forEach((word, index) => {
      const fontSize = Math.max(minFontSize, maxFontSize - (index * 2));
      const angle = (Math.random() - 0.5) * 60; // Random angle between -30 and 30 degrees
      
      // Create text element
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.textContent = word.text;
      text.setAttribute('font-size', fontSize.toString());
      text.setAttribute('font-weight', index < 3 ? 'bold' : 'normal');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('transform', `rotate(${angle})`);
      
      // Color based on importance
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
      text.setAttribute('fill', colors[index % colors.length]);
      
      // Position in a spiral pattern
      const spiralAngle = index * 0.5;
      const spiralRadius = Math.sqrt(index) * 20;
      const x = centerX + Math.cos(spiralAngle) * spiralRadius;
      const y = centerY + Math.sin(spiralAngle) * spiralRadius;
      
      text.setAttribute('x', x.toString());
      text.setAttribute('y', y.toString());
      
      // Add hover effect
      text.style.cursor = 'pointer';
      text.style.transition = 'all 0.3s ease';
      text.addEventListener('mouseenter', () => {
        text.style.opacity = '0.7';
        text.style.transform = `scale(1.1) rotate(${angle}deg)`;
      });
      text.addEventListener('mouseleave', () => {
        text.style.opacity = '1';
        text.style.transform = `scale(1) rotate(${angle}deg)`;
      });
      
      svg.appendChild(text);
    });
  }, [wordData]);

  return (
    <div className="w-full h-96 border border-gray-200 rounded-lg bg-white flex items-center justify-center overflow-hidden">
      {wordData.length > 0 ? (
        <svg ref={svgRef} className="w-full h-full" />
      ) : (
        <p className="text-gray-500">Word cloud will appear here after analysis</p>
      )}
    </div>
  );
};

export default WordCloud;
