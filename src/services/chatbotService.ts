
interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface AnalysisData {
  productInfo?: {
    'Product Name'?: string;
    'Brand Name'?: string;
    'Price'?: string;
  };
  sentimentScore?: number;
  salesTrend?: {
    trend: string;
    message: string;
  };
  commonPhrases?: string[];
  stats?: {
    total_reviews: number;
    positive_reviews: number;
    negative_reviews: number;
  };
}

class ChatbotService {
  private analysisData: AnalysisData | null = null;

  setAnalysisData(data: AnalysisData) {
    this.analysisData = data;
    console.log('🤖 ChatbotService: Analysis data set:', data);
  }

  async processMessage(message: string): Promise<string> {
    console.log('🤖 ChatbotService: Processing message:', message);
    console.log('🤖 ChatbotService: Has analysis data:', !!this.analysisData);
    
    try {
      if (!this.analysisData) {
        console.log('🤖 ChatbotService: No analysis data available');
        return "Please upload and analyze a CSV file first, then I can help you with insights about your data.";
      }

      // Try to call the backend API first
      console.log('🤖 ChatbotService: Attempting API call to /api/chat');
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: message }),
        });

        console.log('🤖 ChatbotService: API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('🤖 ChatbotService: API response data:', data);
          return data.answer || this.generateLocalResponse(message);
        } else {
          console.log('🤖 ChatbotService: API call failed, using local response');
          return this.generateLocalResponse(message);
        }
      } catch (apiError) {
        console.error('🤖 ChatbotService: API error:', apiError);
        console.log('🤖 ChatbotService: Falling back to local response');
        return this.generateLocalResponse(message);
      }
    } catch (error) {
      console.error('🤖 ChatbotService: General error:', error);
      return "Sorry, I encountered an error processing your message. Please try again.";
    }
  }

  private generateLocalResponse(message: string): string {
    console.log('🤖 ChatbotService: Generating local response for:', message);
    
    const lowerMessage = message.toLowerCase();
    const data = this.analysisData!;

    console.log('🤖 ChatbotService: Available data keys:', Object.keys(data));

    // Product information responses
    if (lowerMessage.includes('product') || lowerMessage.includes('name')) {
      const response = `This analysis is for ${data.productInfo?.['Product Name'] || 'the product'} by ${data.productInfo?.['Brand Name'] || 'unknown brand'}, priced at ${data.productInfo?.['Price'] || 'N/A'}.`;
      console.log('🤖 ChatbotService: Product response:', response);
      return response;
    }

    // Sentiment responses
    if (lowerMessage.includes('sentiment') || lowerMessage.includes('feeling')) {
      const score = data.sentimentScore || 0;
      const sentiment = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';
      const response = `The overall sentiment is ${sentiment} with a score of ${score.toFixed(3)}. ${data.salesTrend?.message || ''}`;
      console.log('🤖 ChatbotService: Sentiment response:', response);
      return response;
    }

    // Sales trend responses
    if (lowerMessage.includes('sales') || lowerMessage.includes('trend')) {
      const response = `Sales trend: ${data.salesTrend?.trend || 'Unknown'}. ${data.salesTrend?.message || 'No trend information available.'}`;
      console.log('🤖 ChatbotService: Sales response:', response);
      return response;
    }

    // Review count responses
    if (lowerMessage.includes('how many') || lowerMessage.includes('count') || lowerMessage.includes('total')) {
      const response = `I analyzed ${data.stats?.total_reviews || 0} total reviews: ${data.stats?.positive_reviews || 0} positive, ${data.stats?.negative_reviews || 0} negative.`;
      console.log('🤖 ChatbotService: Count response:', response);
      return response;
    }

    // Common phrases responses
    if (lowerMessage.includes('phrase') || lowerMessage.includes('keyword') || lowerMessage.includes('common')) {
      const phrases = data.commonPhrases?.slice(0, 5) || [];
      const response = phrases.length > 0 
        ? `Common phrases in reviews: ${phrases.join(', ')}`
        : 'No common phrases found in the analysis.';
      console.log('🤖 ChatbotService: Phrases response:', response);
      return response;
    }

    // Complaints/problems responses
    if (lowerMessage.includes('problem') || lowerMessage.includes('complaint') || lowerMessage.includes('issue')) {
      const response = `Based on the sentiment analysis, ${data.stats?.negative_reviews || 0} reviews were negative. Common issues mentioned include the phrases: ${data.commonPhrases?.slice(0, 3).join(', ') || 'none identified'}.`;
      console.log('🤖 ChatbotService: Problems response:', response);
      return response;
    }

    // Default response with helpful suggestions
    const response = `I can help you understand your product analysis! Try asking me about:
    • Product information
    • Overall sentiment
    • Sales trends
    • Review counts
    • Common phrases or complaints
    
    For example: "What's the overall sentiment?" or "How many reviews were analyzed?"`;
    console.log('🤖 ChatbotService: Default response:', response);
    return response;
  }
}

export const chatbotService = new ChatbotService();
export type { ChatMessage };
