
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const SentimentStars = () => {
  const [sentimentData, setSentimentData] = useState({
    score: 0,
    rating: 0
  });

  useEffect(() => {
    console.log('🌟 SentimentStars component mounted');

    // Function to update sentiment data
    const updateSentimentData = (sentimentScore: number) => {
      console.log('🌟 SentimentStars: Updating sentiment data with score:', sentimentScore);
      const clampedScore = Math.max(-1, Math.min(1, sentimentScore));
      const scoreOutOf5 = ((clampedScore + 1) / 2) * 5;
      
      setSentimentData({
        score: sentimentScore,
        rating: scoreOutOf5
      });
      console.log('🌟 SentimentStars: Data updated to:', { score: sentimentScore, rating: scoreOutOf5 });
    };

    // Listen for sentiment data updates from main.js
    const handleSentimentUpdate = (event: CustomEvent) => {
      console.log('🌟 SentimentStars: Received sentimentDataUpdate event:', event.detail);
      const { sentimentScore } = event.detail;
      if (typeof sentimentScore === 'number') {
        updateSentimentData(sentimentScore);
      } else {
        console.warn('🌟 SentimentStars: Invalid sentiment score received:', sentimentScore);
      }
    };

    // Add event listener
    window.addEventListener('sentimentDataUpdate', handleSentimentUpdate as EventListener);
    console.log('🌟 SentimentStars: Event listener added for sentimentDataUpdate');
    
    // Also listen for analysis completion to check for data
    const handleAnalysisComplete = () => {
      console.log('🌟 SentimentStars: Analysis completed, checking for global data...');
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).currentSentimentScore !== undefined) {
          const sentimentScore = (window as any).currentSentimentScore;
          console.log('🌟 SentimentStars: Found sentiment score in global data:', sentimentScore);
          updateSentimentData(sentimentScore);
        } else {
          console.warn('🌟 SentimentStars: No sentiment score found in global data');
        }
      }, 1000); // Longer delay to ensure data is set
    };

    window.addEventListener('analysisCompleted', handleAnalysisComplete);
    console.log('🌟 SentimentStars: Event listener added for analysisCompleted');

    return () => {
      console.log('🌟 SentimentStars: Removing event listeners');
      window.removeEventListener('sentimentDataUpdate', handleSentimentUpdate as EventListener);
      window.removeEventListener('analysisCompleted', handleAnalysisComplete);
    };
  }, []);

  const renderStars = () => {
    const fullStars = Math.floor(sentimentData.rating);
    const hasHalfStar = sentimentData.rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center justify-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-6 w-6 text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-6 w-6 text-gray-300" />
        ))}
      </div>
    );
  };

  console.log('🌟 SentimentStars: Rendering with data:', sentimentData);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Sentiment Rating</h3>
          <div className="rating-display flex flex-col items-center justify-center gap-4">
            {renderStars()}
            <span className="text-lg font-bold text-gray-700">
              ({sentimentData.rating.toFixed(1)}/5)
            </span>
            {sentimentData.score !== 0 && (
              <p className="text-sm text-gray-600">
                Raw sentiment score: {sentimentData.score.toFixed(3)}
              </p>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2">Based on sentiment analysis of customer reviews</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentStars;
