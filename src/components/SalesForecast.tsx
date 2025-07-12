
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SalesTrendData {
  trend: 'Up' | 'Down' | 'Stable';
  avg_sentiment: number;
  message: string;
}

const SalesForecast = () => {
  const [trendData, setTrendData] = useState<SalesTrendData | null>(null);

  useEffect(() => {
    console.log('SalesForecast component mounted');

    // Function to update trend data
    const updateTrendData = (data: SalesTrendData) => {
      console.log('Updating trend data:', data);
      setTrendData(data);
    };

    // Listen for sales trend updates from main.js
    const handleSalesTrendUpdate = (event: CustomEvent) => {
      console.log('SalesForecast received event:', event.detail);
      updateTrendData(event.detail);
    };

    // Add event listener
    window.addEventListener('salesTrendUpdate', handleSalesTrendUpdate as EventListener);
    
    // Check if window has the data already
    const checkForData = () => {
      if (typeof window !== 'undefined' && (window as any).currentSalesTrend) {
        const salesTrend = (window as any).currentSalesTrend;
        console.log('SalesForecast found existing data:', salesTrend);
        updateTrendData(salesTrend);
        return true;
      }
      return false;
    };

    // Check immediately and set up polling
    if (!checkForData()) {
      const pollInterval = setInterval(() => {
        if (checkForData()) {
          clearInterval(pollInterval);
        }
      }, 100);
      
      // Clear after 10 seconds
      setTimeout(() => clearInterval(pollInterval), 10000);
    }

    return () => {
      window.removeEventListener('salesTrendUpdate', handleSalesTrendUpdate as EventListener);
    };
  }, []);

  const getTrendIcon = () => {
    if (!trendData) return <TrendingUp className="h-6 w-6 text-green-600" />;
    
    switch (trendData.trend) {
      case 'Up':
        return <TrendingUp className="h-6 w-6 text-green-600" />;
      case 'Down':
        return <TrendingDown className="h-6 w-6 text-red-600" />;
      case 'Stable':
        return <Minus className="h-6 w-6 text-blue-600" />;
      default:
        return <TrendingUp className="h-6 w-6 text-green-600" />;
    }
  };

  const getTrendColor = () => {
    if (!trendData) return 'text-gray-600';
    
    switch (trendData.trend) {
      case 'Up':
        return 'text-green-700';
      case 'Down':
        return 'text-red-700';
      case 'Stable':
        return 'text-blue-700';
      default:
        return 'text-gray-600';
    }
  };

  const getExplanation = () => {
    if (!trendData) return "Loading forecast data...";
    return trendData.message || "Analysis complete.";
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
      <CardContent className="p-6">
        <div className="info-box">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
            {getTrendIcon()}
            Sales Forecast
          </h3>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${getTrendColor()}`}>
              {trendData?.trend || 'Loading...'}
            </span>
            <span className="text-gray-600">—</span>
            <span className="text-gray-600">{getExplanation()}</span>
          </div>
          {trendData && (
            <p className="text-sm text-gray-500 mt-2">
              Average sentiment: {trendData.avg_sentiment.toFixed(3)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesForecast;
