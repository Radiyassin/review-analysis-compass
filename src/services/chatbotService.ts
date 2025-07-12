
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
    console.log('Chatbot: Analysis data set:', data);
  }

  async processMessage(message: string): Promise<string> {
    try {
      console.log('Chatbot: Processing message:', message);
      
      if (!this.analysisData) {
        return "Please upload and analyze a CSV file first, then I can help you with insights about your data.";
      }

      // Try to call the backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: message }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.answer || this.generateLocalResponse(message);
      } else {
        console.log('API call failed, using local response');
        return this.generateLocalResponse(message);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      return this.generateLocalResponse(message);
    }
  }

  private generateLocalResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    const data = this.analysisData!;

    // Product information responses
    if (lowerMessage.includes('product') || lowerMessage.includes('name')) {
      return `This analysis is for ${data.productInfo?.['Product Name'] || 'the product'} by ${data.productInfo?.['Brand Name'] || 'unknown brand'}, priced at ${data.productInfo?.['Price'] || 'N/A'}.`;
    }

    // Sentiment responses
    if (lowerMessage.includes('sentiment') || lowerMessage.includes('feeling')) {
      const score = data.sentimentScore || 0;
      const sentiment = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';
      return `The overall sentiment is ${sentiment} with a score of ${score.toFixed(3)}. ${data.salesTrend?.message || ''}`;
    }

    // Sales trend responses
    if (lowerMessage.includes('sales') || lowerMessage.includes('trend')) {
      return `Sales trend: ${data.salesTrend?.trend || 'Unknown'}. ${data.salesTrend?.message || 'No trend information available.'}`;
    }

    // Review count responses
    if (lowerMessage.includes('how many') || lowerMessage.includes('count') || lowerMessage.includes('total')) {
      return `I analyzed ${data.stats?.total_reviews || 0} total reviews: ${data.stats?.positive_reviews || 0} positive, ${data.stats?.negative_reviews || 0} negative.`;
    }

    // Common phrases responses
    if (lowerMessage.includes('phrase') || lowerMessage.includes('keyword') || lowerMessage.includes('common')) {
      const phrases = data.commonPhrases?.slice(0, 5) || [];
      return phrases.length > 0 
        ? `Common phrases in reviews: ${phrases.join(', ')}`
        : 'No common phrases found in the analysis.';
    }

    // Complaints/problems responses
    if (lowerMessage.includes('problem') || lowerMessage.includes('complaint') || lowerMessage.includes('issue')) {
      return `Based on the sentiment analysis, ${data.stats?.negative_reviews || 0} reviews were negative. Common issues mentioned include the phrases: ${data.commonPhrases?.slice(0, 3).join(', ') || 'none identified'}.`;
    }

    // Default response with helpful suggestions
    return `I can help you understand your product analysis! Try asking me about:
    • Product information
    • Overall sentiment
    • Sales trends
    • Review counts
    • Common phrases or complaints
    
    For example: "What's the overall sentiment?" or "How many reviews were analyzed?"`;
  }
}

export const chatbotService = new ChatbotService();
export type { ChatMessage };
