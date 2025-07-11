
import React, { useState, useEffect } from 'react';
import { Upload, FileText, TrendingUp, MessageCircle, Download, Star, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import ProductInfo from '@/components/ProductInfo';
import SentimentStars from '@/components/SentimentStars';
import ChartsContainer from '@/components/ChartsContainer';
import WordCloud from '@/components/WordCloud';
import CommonPhrases from '@/components/CommonPhrases';
import Chatbot from '@/components/Chatbot';
import IntroGif from '@/components/IntroGif';

const Index = () => {
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Hide intro gif after 3 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const analyze = () => {
    setIsAnalyzing(true);
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      // Here you would integrate with your existing main.js analyze function
      if (window.analyze) {
        window.analyze();
      }
    }, 2000);
  };

  if (showIntro) {
    return <IntroGif />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Logo */}
      <div className="text-center pt-8 pb-4">
        <img 
          src="/images/okk.png" 
          alt="Logo" 
          className="mx-auto max-h-24 object-contain"
        />
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Sentiment Analysis Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your CSV file and get comprehensive insights into customer sentiment, trends, and key phrases
            </p>
          </div>

          {/* Product Information Card */}
          <ProductInfo />

          {/* File Upload Section */}
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Upload className="h-6 w-6 text-blue-600" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload />
              <div className="text-center mt-6">
                <Button 
                  onClick={analyze}
                  disabled={isAnalyzing}
                  className="btn-blue px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Analyze CSV
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div id="results" className={`space-y-8 ${showResults ? 'block animate-fade-in' : 'hidden'}`}>
            {/* Analysis Results Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Analysis Results</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Sentiment Rating */}
            <SentimentStars />

            {/* Sales Forecast */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-6">
                <div id="salesTrend" className="info-box">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    Sales Forecast
                  </h3>
                  <p id="salesTrendMessage" className="text-gray-600">Loading forecast data...</p>
                </div>
              </CardContent>
            </Card>

            {/* Charts Container */}
            <ChartsContainer />

            {/* Word Cloud */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Word Cloud Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WordCloud />
              </CardContent>
            </Card>

            {/* Common Phrases */}
            <CommonPhrases />

            {/* Download Report */}
            <div className="text-center pt-8">
              <Button 
                id="downloadPdfBtn"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Product Report (PDF)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot />

      {/* Add the main.js script integration */}
      <script src="/js/main.js"></script>
    </div>
  );
};

// Make analyze function available globally for main.js integration
if (typeof window !== 'undefined') {
  window.analyze = () => {
    // Your existing analyze logic from main.js
    console.log('Analyze function called');
  };
}

export default Index;
