
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
    // Listen for sales trend updates from main.js
    const handleSalesTrendUpdate = (event: CustomEvent) => {
      setTrendData(event.detail);
    };

    window.addEventListener('salesTrendUpdate', handleSalesTrendUpdate as EventListener);
    
    // Also check if window has the data already
    if (typeof window !== 'undefined' && (window as any).currentSalesTrend) {
      setTrendData((window as any).currentSalesTrend);
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
    
    switch (trendData.trend) {
      case 'Up':
        return "Customers are mostly satisfied, so the product is likely to sell well.";
      case 'Down':
        return "Many customers are unhappy, which may reduce future sales.";
      case 'Stable':
        return "Customer opinions are mixed, so sales are expected to stay the same.";
      default:
        return trendData.message || "Analysis complete.";
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
            <span className="text-gray-600">{getExplanation()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesForecast;
