'use client';

/**
 * Apollo Onboarding Modal
 * AI-guided onboarding experience for new users
 */

import { useState, useEffect, useRef } from 'react';
import { Music, Send, Sparkles, X } from 'lucide-react';

export default function ApolloOnboarding({ user, onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Check onboarding status on mount
  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch(`/api/acceber/onboarding?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.progress) {
        setProgress(data.progress);
        
        // Show modal if onboarding not completed
        if (!data.progress.is_completed) {
          setIsOpen(true);
          
          // Load initial greeting
          await sendMessage('', true);
        }
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    }
  };
  
  const sendMessage = async (messageText = input, isInitial = false) => {
    if (!messageText.trim() && !isInitial) return;
    
    // Add user message
    if (!isInitial) {
      setMessages(prev => [...prev, {
        role: 'user',
        content: messageText,
        timestamp: new Date(),
      }]);
      setInput('');
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/acceber/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          message: messageText || 'start',
          currentStage: progress?.stage,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add Apollo's response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }]);
        
        // Update progress
        setProgress(data.progress);
        
        // Check if completed
        if (data.progress?.is_completed) {
          setTimeout(() => {
            setIsOpen(false);
            if (onComplete) onComplete();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Music className="w-7 h-7 text-gray-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Welcome to MSC & Co!
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </h2>
              <p className="text-sm text-gray-300">Apollo is here to help you get started</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {progress?.completion_percentage || 0}%
            </div>
            <div className="text-xs text-gray-300">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 transition-all duration-500"
            style={{ width: `${progress?.completion_percentage || 0}%` }}
          />
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-gray-200 rounded-2xl px-5 py-3 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-gray-500">Apollo is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="bg-white border-t-2 border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your answer..."
              disabled={isLoading || progress?.is_completed}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading || progress?.is_completed}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-3">
            Apollo will guide you through setting up your profile • {progress?.completion_percentage || 0}% complete
          </p>
        </div>
      </div>
    </div>
  );
}

