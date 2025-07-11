
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const SentimentStars = () => {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-orange-50">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Sentiment Rating</h3>
          <div id="sentimentStars" className="rating-display flex items-center justify-center gap-4">
            <div className="stars-outer relative">
              <div className="stars-inner absolute top-0 left-0 overflow-hidden text-yellow-400 text-2xl" style={{width: '80%'}}>
                ★★★★★
              </div>
              <div className="text-gray-300 text-2xl">
                ★★★★★
              </div>
            </div>
            <span id="starText" className="text-lg font-bold text-gray-700">(4.0/5)</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Based on sentiment analysis of customer reviews</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentStars;
