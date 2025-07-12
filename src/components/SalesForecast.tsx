
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
  const [isDataStoreReady, setIsDataStoreReady] = useState(false);

  useEffect(() => {
    console.log('📈 SalesForecast component mounted');

    // Function to update trend data
    const updateTrendData = (data: SalesTrendData) => {
      console.log('📈 SalesForecast: Updating with data:', data);
      setTrendData(data);
    };

    let unsubscribe: (() => void) | null = null;
    let retryCount = 0;
    const maxRetries = 50; // Limit retries to prevent infinite loops
    
    const initializeDataStore = () => {
      if (retryCount >= maxRetries) {
        console.warn('📈 SalesForecast: Max retries reached, stopping');
        return;
      }

      if (typeof window !== 'undefined' && window.dataStore) {
        console.log('📈 SalesForecast: Data store found, subscribing');
        setIsDataStoreReady(true);
        
        // Check for existing data
        const existingTrend = window.dataStore.getData('salesTrend');
        if (existingTrend && typeof existingTrend === 'object') {
          console.log('📈 SalesForecast: Found existing trend:', existingTrend);
          updateTrendData(existingTrend);
        }
        
        // Subscribe to changes only once
        unsubscribe = window.dataStore.subscribe((key: string, value: any) => {
          console.log('📈 SalesForecast: Data store update:', key, value);
          if (key === 'salesTrend' && value && typeof value === 'object') {
            updateTrendData(value);
          }
        });
      } else {
        retryCount++;
        if (retryCount <= 10) { // Only log first 10 retries to avoid spam
          console.log('📈 SalesForecast: Data store not ready, retrying...', retryCount);
        }
        setTimeout(initializeDataStore, 200); // Increased delay to reduce CPU usage
      }
    };

    initializeDataStore();

    return () => {
      if (unsubscribe) {
        console.log('📈 SalesForecast: Cleaning up subscription');
        unsubscribe();
      }
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
            <span className="text-gray-600">
              {trendData?.message || "Loading forecast data..."}
            </span>
          </div>
          {trendData && (
            <p className="text-sm text-gray-500 mt-2">
              Average sentiment: {trendData.avg_sentiment.toFixed(3)}
            </p>
          )}
          {!isDataStoreReady && (
            <p className="text-xs text-gray-400 mt-1">Waiting for data...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesForecast;
