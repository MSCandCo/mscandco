'use client';

/**
 * Apollo Intelligence - Chat Interface
 * Beautiful conversational AI for music distribution
 */

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { Send, Mic, MicOff, Sparkles, ArrowLeft, Music } from 'lucide-react';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function ApolloAIChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Load greeting on mount
  useEffect(() => {
    if (user) {
      loadGreeting();
    }
  }, [user]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const loadGreeting = async () => {
    try {
      const response = await fetch('/api/acceber/greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const data = await response.json();
      
      setMessages([{
        role: 'assistant',
        content: data.greeting,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Failed to load greeting:', error);
      setMessages([{
        role: 'assistant',
        content: "Hi! 👋 I'm Acceber, your AI music assistant. How can I help you today?",
        timestamp: new Date(),
      }]);
    }
  };
  
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/acceber/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        tool_calls: data.tool_calls,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again or rephrase your question.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      console.log('🎤 Voice recognition started');
    };
    
    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Voice recognition ended');
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 Transcript:', transcript);
      setInput(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('🎤 Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please enable microphone permissions.');
      }
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  if (!user) {
    return <PageLoading message="Loading Apollo Intelligence..." />;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Apollo Intelligence
              </h1>
              <p className="text-sm text-gray-600">Your AI music distribution assistant</p>
            </div>
          </div>
          
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-6 py-4 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {/* Message content */}
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {msg.content}
                </div>
                
                {/* Show tool calls if any */}
                {msg.tool_calls && msg.tool_calls.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Sparkles size={12} />
                      Actions taken:
                    </p>
                    <div className="space-y-1">
                      {msg.tool_calls.map((tool, i) => (
                        <div
                          key={i}
                          className="text-xs bg-gray-100 rounded-lg px-3 py-1.5 font-medium text-gray-700"
                        >
                          {formatToolName(tool.name)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Timestamp */}
                <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-2xl px-6 py-4 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input */}
      <div className="bg-white border-t px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            {/* Voice button */}
            <button
              onClick={startVoiceInput}
              disabled={isLoading}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg scale-110 animate-pulse'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask Apollo anything..."
              disabled={isLoading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            
            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
          
          {/* Helper text */}
          <div className="mt-3 text-xs text-center text-gray-500">
            <p className="mb-1">
              <span className="font-semibold">Try asking:</span> "Which platform pays me the most?" • "Show my wallet balance" • "I want to release a song"
            </p>
            <p className="text-gray-400">
              Powered by OpenAI GPT-4o-mini • {isListening && '🎤 Listening...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Format tool names for display
 */
function formatToolName(toolName) {
  const names = {
    get_earnings_summary: '📊 Analyzed earnings',
    compare_platforms: '🔍 Compared platforms',
    get_releases: '🎵 Retrieved releases',
    get_wallet_balance: '💰 Checked wallet',
    get_analytics: '📈 Fetched analytics',
    suggest_release_timing: '📅 Suggested timing',
    create_release_draft: '✨ Created draft',
    request_payout: '💸 Requested payout',
  };
  
  return names[toolName] || `🔧 ${toolName}`;
}

