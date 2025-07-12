
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatbotService, ChatMessage } from '@/services/chatbotService';

const NewChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for analysis completion to update chatbot context
  useEffect(() => {
    const handleAnalysisComplete = (event: CustomEvent) => {
      console.log('NewChatbot: Analysis completed, updating context');
      const data = event.detail;
      chatbotService.setAnalysisData({
        productInfo: data.product_info,
        sentimentScore: data.sentiment_score,
        salesTrend: data.sales_trend,
        commonPhrases: data.common_phrases,
        stats: data.stats
      });
    };

    window.addEventListener('analysisCompleted', handleAnalysisComplete as EventListener);
    
    return () => {
      window.removeEventListener('analysisCompleted', handleAnalysisComplete as EventListener);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatbotService.processMessage(inputValue);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chatbox */}
      <div 
        className={`fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Chat Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <span className="font-semibold">AI Assistant</span>
          <Button
            onClick={() => setIsOpen(false)}
            className="p-1 h-auto bg-transparent hover:bg-blue-700 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <div className="bg-gray-100 p-3 rounded-lg text-sm">
              Hello! Upload a CSV file and run analysis, then I can help you understand your data insights!
            </div>
          )}
          
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`p-3 rounded-lg text-sm max-w-xs ${
                message.type === 'user' 
                  ? 'bg-blue-100 ml-auto text-right' 
                  : 'bg-gray-100'
              }`}
            >
              {message.text}
            </div>
          ))}
          
          {isLoading && (
            <div className="bg-gray-100 p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                Thinking...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <Input
            type="text"
            placeholder="Ask about your data..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputValue.trim()}
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default NewChatbot;
