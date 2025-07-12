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
import SalesForecast from '@/components/SalesForecast';
import DownloadReport from '@/components/DownloadReport';

const Index = () => {
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    // Hide intro gif after 3 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Listen for analysis completion
    const handleAnalysisComplete = () => {
      console.log('Analysis completed - showing results');
      setIsAnalyzing(false);
      setShowResults(true);
      setAnalysisComplete(true);
      
      // Scroll to results section
      setTimeout(() => {
        const resultsSection = document.getElementById('results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };

    // Listen for custom events
    window.addEventListener('analysisCompleted', handleAnalysisComplete);
    
    return () => {
      window.removeEventListener('analysisCompleted', handleAnalysisComplete);
    };
  }, []);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    // Call the main.js analyze function if available
    if (typeof window !== 'undefined' && window.analyze) {
      window.analyze().then(() => {
        // The event listener will handle showing results
      }).catch(() => {
        setIsAnalyzing(false);
        alert('Analysis failed. Please try again.');
      });
    } else {
      // Fallback simulation
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResults(true);
        setAnalysisComplete(true);
      }, 2000);
    }
  };

  if (showIntro) {
    return <IntroGif />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Header */}
          <div className="text-center mb-12 pt-8">
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
                  onClick={handleAnalyze}
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

          {/* Analysis Status */}
          {isAnalyzing && (
            <Card className="mb-8 bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-700 font-medium">Processing your CSV file...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {analysisComplete && (
            <Card className="mb-8 bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-green-700 font-medium">Analysis completed successfully! Check the results below.</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          <div id="results" className={`space-y-8 transition-all duration-500 ${showResults ? 'block animate-fade-in' : 'hidden'}`}>
            {/* Analysis Results Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Analysis Results</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Sentiment Rating */}
            <SentimentStars />

            {/* Sales Forecast */}
            <SalesForecast />

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
            <DownloadReport />
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Index;
