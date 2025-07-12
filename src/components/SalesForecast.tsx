
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
    console.log('📈 SalesForecast component mounted');

    let unsubscribe: (() => void) | null = null;
    
    const initializeDataStore = () => {
      if (typeof window !== 'undefined' && window.dataStore) {
        console.log('📈 SalesForecast: DataStore found, subscribing');
        
        // Check for existing data
        const existingTrend = window.dataStore.getData('salesTrend');
        if (existingTrend && typeof existingTrend === 'object') {
          setTrendData(existingTrend);
        }
        
        // Subscribe to changes
        unsubscribe = window.dataStore.subscribe((key: string, value: any) => {
          if (key === 'salesTrend' && value && typeof value === 'object') {
            setTrendData(value);
          }
        });
      }
    };

    // Initialize immediately
    initializeDataStore();

    // Listen for analysis completion event
    const handleAnalysisComplete = (event: CustomEvent) => {
      console.log('📈 SalesForecast: Analysis completed event received');
      if (event.detail && event.detail.sales_trend) {
        setTrendData(event.detail.sales_trend);
      }
    };

    window.addEventListener('analysisCompleted', handleAnalysisComplete as EventListener);

    // Cleanup function
    return () => {
      console.log('📈 SalesForecast: Cleaning up');
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('analysisCompleted', handleAnalysisComplete as EventListener);
    };
  }, []);

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'Up':
        return <TrendingUp className="h-6 w-6 text-green-600" />;
      case 'Down':
        return <TrendingDown className="h-6 w-6 text-red-600" />;
      case 'Stable':
        return <Minus className="h-6 w-6 text-blue-600" />;
      default:
        return <TrendingUp className="h-6 w-6 text-gray-400" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
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

  // Conditional rendering - only show content when data is available
  if (!trendData) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-6">
          <div className="info-box">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
              {getTrendIcon()}
              Sales Forecast
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-bold">Loading...</span>
              <span className="text-gray-600">—</span>
              <span className="text-gray-600">Waiting for analysis data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
      <CardContent className="p-6">
        <div className="info-box">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
            {getTrendIcon(trendData.trend)}
            Sales Forecast
          </h3>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${getTrendColor(trendData.trend)}`}>
              {trendData.trend}
            </span>
            <span className="text-gray-600">—</span>
            <span className="text-gray-600">
              {trendData.message}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Average sentiment: {trendData.avg_sentiment.toFixed(3)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesForecast;
