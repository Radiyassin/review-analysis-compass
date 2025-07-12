
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

    // Function to update trend data
    const updateTrendData = (data: SalesTrendData) => {
      console.log('📈 SalesForecast: Updating with data:', data);
      setTrendData(data);
    };

    // Listen for sales trend updates
    const handleSalesTrendUpdate = (event: CustomEvent) => {
      console.log('📈 SalesForecast: Received event:', event.detail);
      if (event.detail && typeof event.detail === 'object') {
        updateTrendData(event.detail);
      }
    };

    // Check for existing global data
    const checkGlobalData = () => {
      console.log('📈 SalesForecast: Checking global data...');
      if (typeof window !== 'undefined' && (window as any).currentSalesTrend) {
        const salesTrend = (window as any).currentSalesTrend;
        console.log('📈 SalesForecast: Found global sales trend:', salesTrend);
        updateTrendData(salesTrend);
        return true;
      }
      return false;
    };

    // Try to get existing data immediately
    if (!checkGlobalData()) {
      console.log('📈 SalesForecast: No existing data, waiting for events...');
    }

    // Add event listeners
    window.addEventListener('salesTrendUpdate', handleSalesTrendUpdate as EventListener);
    window.addEventListener('analysisCompleted', () => {
      console.log('📈 SalesForecast: Analysis completed, checking for data...');
      setTimeout(() => checkGlobalData(), 100);
    });

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

  console.log('📈 SalesForecast: Current data:', trendData);

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
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesForecast;
