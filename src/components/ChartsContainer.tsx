
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

interface ChartData {
  sentiment?: {
    labels: string[];
    means: number[];
  };
  distribution?: {
    labels: string[];
    values: number[];
  };
  counts?: {
    labels: string[];
    values: number[];
  };
}

const ChartsContainer = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  
  useEffect(() => {
    console.log('📊 ChartsContainer component mounted');

    let unsubscribe: (() => void) | null = null;
    
    const initializeDataStore = () => {
      if (typeof window !== 'undefined' && window.dataStore) {
        console.log('📊 ChartsContainer: DataStore found, subscribing');
        
        // Check for existing data
        const existingChartData = window.dataStore.getData('chartData');
        if (existingChartData && typeof existingChartData === 'object') {
          setChartData(existingChartData);
        }
        
        // Subscribe to changes
        unsubscribe = window.dataStore.subscribe((key: string, value: any) => {
          if (key === 'chartData' && value && typeof value === 'object') {
            setChartData(value);
          }
        });
      }
    };

    // Initialize immediately
    initializeDataStore();

    // Listen for analysis completion event
    const handleAnalysisComplete = (event: CustomEvent) => {
      console.log('📊 ChartsContainer: Analysis completed event received');
      if (event.detail && event.detail.chart_data) {
        setChartData(event.detail.chart_data);
      }
    };

    window.addEventListener('analysisCompleted', handleAnalysisComplete as EventListener);

    // Cleanup function
    return () => {
      console.log('📊 ChartsContainer: Cleaning up');
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('analysisCompleted', handleAnalysisComplete as EventListener);
    };
  }, []);

  return (
    <div className="chart-container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {chartData ? (
        <>
          <ChartCard
            title="Sentiment Scores"
            icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
            data={chartData.sentiment}
            chartType="bar"
          />
          <ChartCard
            title="Review Distribution"
            icon={<PieChart className="h-6 w-6 text-purple-600" />}
            data={chartData.distribution}
            chartType="doughnut"
          />
          <ChartCard
            title="Review Counts"
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            data={chartData.counts}
            chartType="bar"
          />
        </>
      ) : (
        <>
          <PlaceholderCard
            title="Sentiment Scores"
            icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
          />
          <PlaceholderCard
            title="Review Distribution"
            icon={<PieChart className="h-6 w-6 text-purple-600" />}
          />
          <PlaceholderCard
            title="Review Counts"
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
          />
        </>
      )}
    </div>
  );
};

interface ChartCardProps {
  title: string;
  icon: React.ReactNode;
  data?: {
    labels: string[];
    means?: number[];
    values?: number[];
  };
  chartType: 'bar' | 'doughnut';
}

const ChartCard: React.FC<ChartCardProps> = ({ title, icon, data, chartType }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!data || !canvasRef.current || typeof window === 'undefined' || !window.Chart) {
      return;
    }

    console.log(`📊 Rendering ${title} chart with data:`, data);

    // Destroy existing chart instance
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.destroy();
      } catch (error) {
        console.warn(`📊 Error destroying ${title} chart:`, error);
      }
      chartInstanceRef.current = null;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      let chartConfig: any = {
        type: chartType,
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              display: chartType === 'doughnut',
              labels: {
                font: {
                  size: 14,
                  weight: 'bold'
                }
              }
            }
          },
          scales: chartType === 'bar' ? {
            x: {
              ticks: {
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            },
            y: {
              ticks: {
                font: {
                  size: 12,
                  weight: 'bold'
                }
              }
            }
          } : undefined
        }
      };

      if (chartType === 'bar') {
        chartConfig.data = {
          labels: data.labels || ['Default'],
          datasets: [{
            label: title,
            data: data.means || data.values || [0],
            backgroundColor: title.includes('Sentiment') ? ['#10B981', '#EF4444'] : ['#3B82F6']
          }]
        };
      } else if (chartType === 'doughnut') {
        chartConfig.data = {
          labels: data.labels || ['Positive', 'Neutral', 'Negative'],
          datasets: [{
            data: data.values || [0, 0, 0],
            backgroundColor: ['#10B981', '#6B7280', '#EF4444']
          }]
        };
      }

      chartInstanceRef.current = new window.Chart(ctx, chartConfig);
      console.log(`📊 ${title} chart rendered successfully`);
    } catch (error) {
      console.error(`📊 Error rendering ${title} chart:`, error);
    }

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
        } catch (error) {
          console.warn(`📊 Error cleaning up ${title} chart:`, error);
        }
        chartInstanceRef.current = null;
      }
    };
  }, [data, title, chartType]);

  return (
    <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-6 rounded-lg h-80 shadow-inner">
          <canvas ref={canvasRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
};

interface PlaceholderCardProps {
  title: string;
  icon: React.ReactNode;
}

const PlaceholderCard: React.FC<PlaceholderCardProps> = ({ title, icon }) => {
  return (
    <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-6 rounded-lg h-80 flex items-center justify-center shadow-inner">
          <p className="text-gray-500 font-medium">Waiting for analysis data...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartsContainer;
