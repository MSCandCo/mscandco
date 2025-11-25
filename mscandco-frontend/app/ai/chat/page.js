'use client';

/**
 * Apollo Intelligence - Chat Interface
 * Beautiful conversational AI for music distribution
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [greetingLoaded, setGreetingLoaded] = useState(false);
  const [insights, setInsights] = useState([]);
  const [insightsLoaded, setInsightsLoaded] = useState(false);
  const [thinkingMessages, setThinkingMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const thinkingIntervalRef = useRef(null);
  
  // Load greeting on mount (memoized)
  const loadGreeting = useCallback(async () => {
    if (!user || greetingLoaded) return;
    
    try {
      const response = await fetch('/api/apollo/greeting', {
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
      setGreetingLoaded(true);
    } catch (error) {
      console.error('Failed to load greeting:', error);
      setMessages([{
        role: 'assistant',
        content: "Hi! 👋 I'm Apollo, your music intelligence assistant. How can I help you today?",
        timestamp: new Date(),
      }]);
      setGreetingLoaded(true);
    }
  }, [user, greetingLoaded]);
  
  useEffect(() => {
    loadGreeting();
  }, [loadGreeting]);
  
  // Load insights on mount
  const loadInsights = useCallback(async () => {
    if (!user || insightsLoaded) return;
    
    try {
      const response = await fetch(`/api/apollo/insights?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setInsights(data.insights || []);
        setInsightsLoaded(true);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
      setInsightsLoaded(true);
    }
  }, [user, insightsLoaded]);
  
  useEffect(() => {
    loadInsights();
  }, [loadInsights]);
  
  // Auto-scroll to bottom when new messages arrive (but not on initial load)
  useEffect(() => {
    // Only auto-scroll if there are messages and we're not at the initial load
    if (messages.length > 0 && greetingLoaded) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, greetingLoaded]);
  
  // Prevent scroll restoration on page load
  useEffect(() => {
    // Scroll to top on mount to prevent weird scroll positions
    window.scrollTo(0, 0);
    // Disable browser scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);
  
  // Handle insight action
  const handleInsightAction = async (insight) => {
    if (!insight.action) return;
    
    // Send insight as a message to Apollo
    const insightMessage = `${insight.message} (Action: ${insight.action})`;
    setInput(insightMessage);
    await sendMessage();
  };
  
  // Dismiss insight
  const dismissInsight = async (insightId) => {
    try {
      await fetch('/api/apollo/insights', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId, userId: user.id }),
      });
      
      setInsights(insights.filter(i => i.id !== insightId));
    } catch (error) {
      console.error('Failed to dismiss insight:', error);
    }
  };
  
  // Thinking messages that rotate while processing
  const thinkingSteps = [
    "Analyzing your question...",
    "Gathering relevant information from your account...",
    "Checking your releases and earnings data...",
    "Processing insights and patterns...",
    "Formulating the best response...",
    "Almost ready..."
  ];

  const startThinkingIndicator = () => {
    let currentStep = 0;
    setThinkingMessages([thinkingSteps[0]]);
    
    thinkingIntervalRef.current = setInterval(() => {
      currentStep++;
      if (currentStep < thinkingSteps.length) {
        setThinkingMessages(prev => [...prev, thinkingSteps[currentStep]]);
      } else {
        // Cycle back or stop
        clearInterval(thinkingIntervalRef.current);
      }
    }, 2000); // Show new thinking message every 2 seconds
  };

  const stopThinkingIndicator = () => {
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
    setThinkingMessages([]);
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
    startThinkingIndicator();
    
    try {
      const response = await fetch('/api/apollo/chat', {
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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('❌ Apollo API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.response) {
        console.error('❌ Apollo API returned invalid response:', data);
        throw new Error('Invalid response from Apollo');
      }
      
      stopThinkingIndicator();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        tool_calls: data.tool_calls,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('❌ Chat error:', error);
      stopThinkingIndicator();
      const errorMessage = error.message || "Sorry, I encountered an error. Please try again or rephrase your question.";
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again or contact support if the issue persists.`,
        timestamp: new Date(),
        isError: true,
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
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, []);
  
  if (!user) {
    return <PageLoading message="Loading Apollo Intelligence..." />;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4 shadow-sm flex-shrink-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
              <Music className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Apollo Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Your music intelligence assistant</p>
            </div>
          </div>
          
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline font-medium">Use Regular Version</span>
            <span className="sm:hidden font-medium">Regular</span>
          </Link>
        </div>
      </div>
      
      {/* Messages - Scrollable area that takes remaining space */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 min-h-0 overscroll-contain">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Proactive Insights */}
          {insights.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                <Sparkles size={16} className="text-gray-900" />
                Apollo's Insights for You
              </div>
              
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`bg-gradient-to-r ${
                    insight.priority === 'high' 
                      ? 'from-blue-50 to-purple-50 border-blue-200' 
                      : insight.priority === 'medium'
                      ? 'from-green-50 to-teal-50 border-green-200'
                      : 'from-gray-50 to-slate-50 border-gray-200'
                  } border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{insight.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {insight.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        {insight.message}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        {insight.action && (
                          <button
                            onClick={() => handleInsightAction(insight)}
                            className="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            Take Action
                          </button>
                        )}
                        <button
                          onClick={() => dismissInsight(insight.id)}
                          className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-2xl rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-md ${
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
          
          {/* Thinking indicator */}
          {isLoading && thinkingMessages.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm max-w-[85%] sm:max-w-2xl">
                <div className="space-y-2">
                  {thinkingMessages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className="text-sm text-gray-500 italic animate-fade-in"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      {msg}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>
      
      {/* Input - Fixed at bottom */}
      <div className="bg-white border-t px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 sm:gap-3">
            {/* Voice button */}
            <button
              onClick={startVoiceInput}
              disabled={isLoading}
              className={`p-2.5 sm:p-3 rounded-xl transition-all flex-shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg scale-110 animate-pulse'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={18} className="sm:w-5 sm:h-5" /> : <Mic size={18} className="sm:w-5 sm:h-5" />}
            </button>
            
            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask Apollo anything..."
              disabled={isLoading}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            
            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          
          {/* Helper text */}
          <div className="mt-2 sm:mt-3 text-xs text-center text-gray-500">
            <p className="mb-1 hidden sm:block">
              <span className="font-semibold">Try asking:</span> "Which platform pays me the most?" • "Show my wallet balance" • "I want to release a song"
            </p>
            <p className="text-gray-400 text-xs">
              Powered by OpenAI GPT-4o-mini {isListening && '• 🎤 Listening...'}
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
    update_profile: '✏️ Updated profile',
    get_profile: '👤 Retrieved profile',
  };
  
  return names[toolName] || `🔧 ${toolName}`;
}

