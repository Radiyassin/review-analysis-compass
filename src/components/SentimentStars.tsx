
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface SentimentData {
  score: number;
  rating: number;
}

const SentimentStars = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);

  useEffect(() => {
    console.log('🌟 SentimentStars component mounted');

    // Function to update sentiment data
    const updateSentimentData = (sentimentScore: number) => {
      console.log('🌟 SentimentStars: UPDATING with score:', sentimentScore);
      const clampedScore = Math.max(-1, Math.min(1, sentimentScore));
      const scoreOutOf5 = ((clampedScore + 1) / 2) * 5;
      
      setSentimentData({
        score: sentimentScore,
        rating: scoreOutOf5
      });
    };

    let unsubscribe: (() => void) | null = null;

    const initializeDataStore = () => {
      if (typeof window !== 'undefined' && window.dataStore) {
        console.log('🌟 SentimentStars: DataStore found, subscribing');
        
        // Check for existing data
        const existingScore = window.dataStore.getData('sentimentScore');
        if (typeof existingScore === 'number' && existingScore !== 0) {
          updateSentimentData(existingScore);
        }
        
        // Subscribe to changes
        unsubscribe = window.dataStore.subscribe((key: string, value: any) => {
          if (key === 'sentimentScore' && typeof value === 'number') {
            updateSentimentData(value);
          }
        });
      }
    };

    // Initialize immediately
    initializeDataStore();

    // Listen for analysis completion event
    const handleAnalysisComplete = (event: CustomEvent) => {
      console.log('🌟 SentimentStars: Analysis completed event received');
      if (event.detail && typeof event.detail.sentiment_score === 'number') {
        updateSentimentData(event.detail.sentiment_score);
      }
    };

    window.addEventListener('analysisCompleted', handleAnalysisComplete as EventListener);

    // Cleanup function
    return () => {
      console.log('🌟 SentimentStars: Component unmounting, cleaning up');
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('analysisCompleted', handleAnalysisComplete as EventListener);
    };
  }, []);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: fullStars }, (_, i) => (
          <Star key={`full-${i}`} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div key="half-star" className="relative">
            <Star className="h-6 w-6 text-gray-300" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Star key={`empty-${i}`} className="h-6 w-6 text-gray-300" />
        ))}
      </div>
    );
  };

  // Conditional rendering - only show when data is available
  if (!sentimentData) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Sentiment Rating</h3>
            <div className="rating-display flex flex-col items-center justify-center gap-4">
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={`placeholder-${i}`} className="h-6 w-6 text-gray-300" />
                ))}
              </div>
              <span className="text-lg font-bold text-gray-700">(0.0/5)</span>
              <p className="text-sm text-gray-600">Waiting for analysis...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Sentiment Rating</h3>
          <div className="rating-display flex flex-col items-center justify-center gap-4">
            {renderStars(sentimentData.rating)}
            <span className="text-lg font-bold text-gray-700">
              ({sentimentData.rating.toFixed(1)}/5)
            </span>
            <p className="text-sm text-gray-600">
              Raw sentiment score: {sentimentData.score.toFixed(3)}
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-2">Based on sentiment analysis of customer reviews</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentStars;
