
import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', text: string}>>([]);
  const [inputValue, setInputValue] = useState('');

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    // Also call the main.js function if available
    if (typeof window !== 'undefined' && window.toggleChatbot) {
      window.toggleChatbot();
    }
  };

  const askBot = async () => {
    if (inputValue.trim()) {
      setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
      
      // Call the main.js function if available
      if (typeof window !== 'undefined' && window.askBot) {
        await window.askBot();
      } else {
        // Fallback response
        setTimeout(() => {
          setMessages(prev => [...prev, { type: 'bot', text: 'Thanks for your question! I\'m here to help with your sentiment analysis.' }]);
        }, 1000);
      }
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      askBot();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        id="chat-toggle"
        onClick={toggleChatbot}
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
        id="chatbox" 
        className={`fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible chat-hidden'
        }`}
      >
        {/* Chat Header */}
        <div className="chat-header bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <span className="font-semibold">Assistant</span>
          <Button
            onClick={toggleChatbot}
            className="p-1 h-auto bg-transparent hover:bg-blue-700 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Log */}
        <div id="chat-log" className="chat-log flex-1 p-4 overflow-y-auto space-y-3">
          {messages.length === 0 && (
            <div className="message bot bg-gray-100 p-3 rounded-lg text-sm">
              Hello! I'm here to help you with your sentiment analysis dashboard. Ask me anything!
            </div>
          )}
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.type} p-3 rounded-lg text-sm max-w-xs ${
                message.type === 'user' 
                  ? 'bg-blue-100 ml-auto text-right' 
                  : 'bg-gray-100'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="chat-input p-4 border-t border-gray-200 flex gap-2">
          <Input
            id="userQuestion"
            type="text"
            placeholder="Ask something..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={askBot} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
