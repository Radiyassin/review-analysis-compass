
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
    <div className="chart-container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {chartData ? (
        <>
          <ChartCard
            title="Sentiment Scores"
            icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
            data={chartData.sentiment}
            chartType="bar"
          />
          <ChartCard
            title="Review Distribution"
            icon={<PieChart className="h-5 w-5 text-purple-600" />}
            data={chartData.distribution}
            chartType="doughnut"
          />
          <ChartCard
            title="Review Counts"
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            data={chartData.counts}
            chartType="bar"
          />
        </>
      ) : (
        <>
          <PlaceholderCard
            title="Sentiment Scores"
            icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
          />
          <PlaceholderCard
            title="Review Distribution"
            icon={<PieChart className="h-5 w-5 text-purple-600" />}
          />
          <PlaceholderCard
            title="Review Counts"
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
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

    console.log(`📊 Initializing ${title} chart with data:`, data);

    // Destroy existing chart instance before creating new one
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      } catch (error) {
        console.warn(`📊 Error destroying ${title} chart:`, error);
      }
    }

    try {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear the canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      let chartConfig: any = {
        type: chartType,
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: chartType === 'doughnut' }
          }
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
      console.log(`📊 ${title} chart initialized successfully`);
    } catch (error) {
      console.error(`📊 Error initializing ${title} chart:`, error);
    }

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        } catch (error) {
          console.warn(`📊 Error cleaning up ${title} chart:`, error);
        }
      }
    };
  }, [data, title, chartType]);

  return (
    <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-4 rounded-lg h-64">
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
    <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-4 rounded-lg h-64 flex items-center justify-center">
          <p className="text-gray-500">Waiting for analysis data...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartsContainer;
