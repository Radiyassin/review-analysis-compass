
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const SentimentStars = () => {
  const [sentimentData, setSentimentData] = useState({
    score: 0,
    rating: 0
  });
  const [isDataStoreReady, setIsDataStoreReady] = useState(false);

  useEffect(() => {
    console.log('🌟 SentimentStars component mounted');

    // Function to update sentiment data
    const updateSentimentData = (sentimentScore: number) => {
      console.log('🌟 SentimentStars: Updating with score:', sentimentScore);
      const clampedScore = Math.max(-1, Math.min(1, sentimentScore));
      const scoreOutOf5 = ((clampedScore + 1) / 2) * 5;
      
      setSentimentData({
        score: sentimentScore,
        rating: scoreOutOf5
      });
      console.log('🌟 SentimentStars: Updated to rating:', scoreOutOf5);
    };

    let unsubscribe: (() => void) | null = null;
    let retryCount = 0;
    const maxRetries = 50; // Limit retries to prevent infinite loops
    
    const initializeDataStore = () => {
      if (retryCount >= maxRetries) {
        console.warn('🌟 SentimentStars: Max retries reached, stopping');
        return;
      }

      if (typeof window !== 'undefined' && window.dataStore) {
        console.log('🌟 SentimentStars: Data store found, subscribing');
        setIsDataStoreReady(true);
        
        // Check for existing data
        const existingScore = window.dataStore.getData('sentimentScore');
        if (typeof existingScore === 'number') {
          console.log('🌟 SentimentStars: Found existing score:', existingScore);
          updateSentimentData(existingScore);
        }
        
        // Subscribe to changes only once
        unsubscribe = window.dataStore.subscribe((key: string, value: any) => {
          console.log('🌟 SentimentStars: Data store update:', key, value);
          if (key === 'sentimentScore' && typeof value === 'number') {
            updateSentimentData(value);
          }
        });
      } else {
        retryCount++;
        if (retryCount <= 10) { // Only log first 10 retries to avoid spam
          console.log('🌟 SentimentStars: Data store not ready, retrying...', retryCount);
        }
        setTimeout(initializeDataStore, 200); // Increased delay to reduce CPU usage
      }
    };

    initializeDataStore();

    return () => {
      if (unsubscribe) {
        console.log('🌟 SentimentStars: Cleaning up subscription');
        unsubscribe();
      }
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
          {!isDataStoreReady && (
            <p className="text-xs text-gray-400 mt-1">Waiting for data...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentStars;
