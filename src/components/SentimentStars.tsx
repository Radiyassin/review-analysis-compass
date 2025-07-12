
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const SentimentStars = () => {
  const [sentimentData, setSentimentData] = useState({
    score: 0,
    rating: 0
  });

  useEffect(() => {
    console.log('🌟 SentimentStars component mounted and initializing...');

    // Function to update sentiment data
    const updateSentimentData = (sentimentScore: number) => {
      console.log('🌟 SentimentStars: UPDATING with score:', sentimentScore);
      const clampedScore = Math.max(-1, Math.min(1, sentimentScore));
      const scoreOutOf5 = ((clampedScore + 1) / 2) * 5;
      
      setSentimentData({
        score: sentimentScore,
        rating: scoreOutOf5
      });
      console.log('🌟 SentimentStars: STATE UPDATED - Rating:', scoreOutOf5, 'Score:', sentimentScore);
    };

    let unsubscribe: (() => void) | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 50; // Increase retry attempts
    
    const initializeDataStore = () => {
      retryCount++;
      console.log(`🌟 SentimentStars: Initialization attempt ${retryCount}/${MAX_RETRIES}`);
      
      if (typeof window !== 'undefined' && window.dataStore) {
        console.log('🌟 SentimentStars: ✅ DataStore found! Subscribing to updates...');
        
        // Check for existing data
        const existingScore = window.dataStore.getData('sentimentScore');
        console.log('🌟 SentimentStars: Checking existing data - Score:', existingScore);
        
        if (typeof existingScore === 'number' && existingScore !== 0) {
          console.log('🌟 SentimentStars: Found existing score, updating immediately:', existingScore);
          updateSentimentData(existingScore);
        }
        
        // Subscribe to changes
        unsubscribe = window.dataStore.subscribe((key: string, value: any, allData: any) => {
          console.log('🌟 SentimentStars: DataStore notification received!');
          console.log('🌟 Key:', key, 'Value:', value);
          console.log('🌟 All data:', allData);
          
          if (key === 'sentimentScore' && typeof value === 'number') {
            console.log('🌟 SentimentStars: Sentiment score updated via subscription:', value);
            updateSentimentData(value);
          }
        });
        
        console.log('🌟 SentimentStars: Successfully subscribed to DataStore');
        
      } else {
        if (retryCount < MAX_RETRIES) {
          console.log('🌟 SentimentStars: DataStore not ready, retrying in 100ms...');
          setTimeout(initializeDataStore, 100);
        } else {
          console.error('🌟 SentimentStars: ❌ DataStore not available after maximum retries');
        }
      }
    };

    // Try to initialize immediately
    initializeDataStore();

    // Also listen for the analysis completion event
    const handleAnalysisComplete = (event: CustomEvent) => {
      console.log('🌟 SentimentStars: 📢 Analysis completed event received!');
      console.log('🌟 Event detail:', event.detail);
      
      if (event.detail && typeof event.detail.sentiment_score === 'number') {
        console.log('🌟 SentimentStars: Updating from event - Score:', event.detail.sentiment_score);
        updateSentimentData(event.detail.sentiment_score);
      } else {
        console.log('🌟 SentimentStars: No sentiment score in event detail');
      }
    };

    window.addEventListener('analysisCompleted', handleAnalysisComplete as EventListener);
    console.log('🌟 SentimentStars: Event listener added for analysisCompleted');

    return () => {
      console.log('🌟 SentimentStars: Component unmounting, cleaning up...');
      if (unsubscribe) {
        console.log('🌟 SentimentStars: Removing DataStore subscription');
        unsubscribe();
      }
      window.removeEventListener('analysisCompleted', handleAnalysisComplete as EventListener);
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
