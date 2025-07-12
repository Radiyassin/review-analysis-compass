
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
  const sentimentChartRef = useRef<HTMLCanvasElement>(null);
  const distributionChartRef = useRef<HTMLCanvasElement>(null);
  const countChartRef = useRef<HTMLCanvasElement>(null);
  
  // Store chart instances for cleanup
  const chartsRef = useRef<{
    sentimentChart?: any;
    distributionChart?: any;
    countChart?: any;
  }>({});

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
      
      // Destroy all chart instances
      Object.values(chartsRef.current).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
      chartsRef.current = {};
    };
  }, []);

  useEffect(() => {
    // Only initialize charts when we have data and Chart.js is available
    if (!chartData || typeof window === 'undefined' || !window.Chart) {
      return;
    }

    console.log('📊 Initializing charts with data:', chartData);

    // Destroy existing charts before creating new ones
    Object.values(chartsRef.current).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    chartsRef.current = {};

    try {
      // Initialize Sentiment Chart
      if (sentimentChartRef.current && chartData.sentiment) {
        chartsRef.current.sentimentChart = new window.Chart(sentimentChartRef.current, {
          type: 'bar',
          data: {
            labels: chartData.sentiment.labels || ['Positive', 'Negative'],
            datasets: [{
              label: 'Sentiment Scores',
              data: chartData.sentiment.means || [0, 0],
              backgroundColor: ['#10B981', '#EF4444']
            }]
          },
          options: { 
            responsive: true, 
            plugins: { legend: { display: false } },
            maintainAspectRatio: false
          }
        });
      }

      // Initialize Distribution Chart
      if (distributionChartRef.current && chartData.distribution) {
        chartsRef.current.distributionChart = new window.Chart(distributionChartRef.current, {
          type: 'doughnut',
          data: {
            labels: chartData.distribution.labels || ['Positive', 'Neutral', 'Negative'],
            datasets: [{
              data: chartData.distribution.values || [0, 0, 0],
              backgroundColor: ['#10B981', '#6B7280', '#EF4444']
            }]
          },
          options: { 
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }

      // Initialize Count Chart
      if (countChartRef.current && chartData.counts) {
        chartsRef.current.countChart = new window.Chart(countChartRef.current, {
          type: 'bar',
          data: {
            labels: chartData.counts.labels || ['Total Reviews'],
            datasets: [{
              label: 'Count',
              data: chartData.counts.values || [0],
              backgroundColor: ['#3B82F6']
            }]
          },
          options: { 
            responsive: true, 
            plugins: { legend: { display: false } },
            maintainAspectRatio: false
          }
        });
      }

      console.log('📊 Charts initialized successfully');
    } catch (error) {
      console.error('📊 Error initializing charts:', error);
    }

    // Cleanup function for this effect
    return () => {
      Object.values(chartsRef.current).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
      chartsRef.current = {};
    };
  }, [chartData]); // Re-run when chartData changes

  // Conditional rendering - only show charts when data is available
  if (!chartData) {
    return (
      <div className="chart-container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Sentiment Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">Waiting for analysis data...</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-purple-600" />
              Review Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">Waiting for analysis data...</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Review Counts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">Waiting for analysis data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="chart-container grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Sentiment Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg h-64">
            <canvas ref={sentimentChartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChart className="h-5 w-5 text-purple-600" />
            Review Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg h-64">
            <canvas ref={distributionChartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Review Counts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg h-64">
            <canvas ref={countChartRef}></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsContainer;
