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
  const messagesContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  
  // Track page visits for context-aware greetings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get the referrer to know where user came from
      const referrer = document.referrer;
      const currentPath = window.location.pathname;
      
      // Extract meaningful page context from referrer
      let recentPage = null;
      if (referrer) {
        try {
          const referrerUrl = new URL(referrer);
          recentPage = referrerUrl.pathname;
        } catch (e) {
          // Invalid URL, use as-is
          recentPage = referrer;
        }
      }
      
      // Store in sessionStorage for greeting API
      if (recentPage) {
        sessionStorage.setItem('apollo_recent_page', recentPage);
      }
    }
  }, []);

  // Load greeting on mount (memoized)
  const loadGreeting = useCallback(async () => {
    if (!user || greetingLoaded) return;
    
    try {
      // Get recent page visit from sessionStorage to make greeting context-aware
      const recentPage = typeof window !== 'undefined' ? sessionStorage.getItem('apollo_recent_page') : null;
      
      const response = await fetch('/api/apollo/greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          recentPage: recentPage 
        }),
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
  
  // Check if user is near bottom of scroll container (define first)
  const isNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  // Auto-scroll to bottom only if user is near bottom (define before useEffects)
  const scrollToBottom = useCallback((force = false) => {
    if (!force && !shouldAutoScrollRef.current) return;
    if (!force && !isNearBottom()) return;
    
    setTimeout(() => {
      if (messagesEndRef.current && messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }, [isNearBottom]);
  
  useEffect(() => {
    loadGreeting();
    // Scroll to bottom after greeting loads
    setTimeout(() => {
      shouldAutoScrollRef.current = true;
      scrollToBottom(true);
    }, 500);
  }, [loadGreeting, scrollToBottom]);
  
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
  
  // Prevent scroll restoration on page load and scroll to bottom on initial load
  useEffect(() => {
    // Disable browser scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Scroll to bottom on initial load after a short delay to ensure DOM is ready
    setTimeout(() => {
      shouldAutoScrollRef.current = true;
      scrollToBottom(true);
    }, 300);
  }, [scrollToBottom]);

  // Track scroll position to determine if we should auto-scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      shouldAutoScrollRef.current = isNearBottom();
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isNearBottom]);
  
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
  
  // DEMO MODE: Platform distribution animation
  const DEMO_MODE = false; // Set to true for demo
  const platforms = [
    "Spotify",
    "Apple Music",
    "Amazon Music",
    "YouTube Music",
    "Tidal",
    "Deezer",
    "SoundCloud",
    "Pandora",
    "iHeartRadio",
    "TikTok",
    "Instagram Music",
    "Facebook Music",
    "Snapchat",
    "Twitch",
    "Bandcamp"
  ];

  // Thinking messages that rotate while processing
  const thinkingSteps = DEMO_MODE ? [
    "Distributing music to digital platforms...",
    "Scanning comprehensive platform list...",
    "Sending music to streaming services...",
    "Finalizing distribution...",
    "Almost ready..."
  ] : [
    "Analyzing your question...",
    "Gathering relevant information from your account...",
    "Checking your releases and earnings data...",
    "Processing insights and patterns...",
    "Formulating the best response...",
    "Almost ready..."
  ];

  const [distributedPlatforms, setDistributedPlatforms] = useState([]);
  const thinkingStartTimeRef = useRef(null);

  const startThinkingIndicator = () => {
    if (DEMO_MODE) {
      // Demo mode: Show platform distribution
      thinkingStartTimeRef.current = Date.now();
      setDistributedPlatforms([]);
      let platformIndex = 0;
      
      thinkingIntervalRef.current = setInterval(() => {
        if (platformIndex < platforms.length) {
          setDistributedPlatforms(prev => [...prev, platforms[platformIndex]]);
          platformIndex++;
        }
        // Don't clear interval here - let it continue until we explicitly stop it
      }, 300); // Add a platform every 300ms
    } else {
      // Normal mode: Show thinking steps
      let currentStep = 0;
      setThinkingMessages([thinkingSteps[0]]);
      
      thinkingIntervalRef.current = setInterval(() => {
        currentStep++;
        if (currentStep < thinkingSteps.length) {
          setThinkingMessages(prev => [...prev, thinkingSteps[currentStep]]);
        } else {
          clearInterval(thinkingIntervalRef.current);
        }
      }, 2000);
    }
  };

  const stopThinkingIndicator = () => {
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
    setThinkingMessages([]);
    setDistributedPlatforms([]);
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
    
    // Force scroll to bottom when user sends a message
    shouldAutoScrollRef.current = true;
    scrollToBottom(true);
    
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
        // Use user-friendly error message from API
        const errorMessage = errorData.error || errorData.message || errorData.details || `I encountered an issue. Please try again.`;
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
      
      if (DEMO_MODE && data.demo) {
        // Demo mode: Wait at least 6 seconds for thinking phase, then show response
        const minThinkingDuration = 6000; // 6 seconds minimum
        const thinkingStartTime = thinkingStartTimeRef.current || Date.now();
        
        const checkAndStartResponse = () => {
          const elapsed = Date.now() - thinkingStartTime;
          const remaining = Math.max(0, minThinkingDuration - elapsed);
          
          setTimeout(() => {
            stopThinkingIndicator();
            
            // Demo mode: Stream response line by line
            const lines = data.response.split('\n').filter(line => line.trim());
            
            // Add assistant message placeholder
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: '',
              tool_calls: data.tool_calls,
              timestamp: new Date(),
            }]);
            
            let currentLine = 0;
            let currentContent = '';
            
            const streamInterval = setInterval(() => {
              if (currentLine < lines.length) {
                currentContent += lines[currentLine] + '\n';
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = currentContent;
                  }
                  return newMessages;
                });
                currentLine++;
                // Only scroll if user hasn't scrolled up
                if (shouldAutoScrollRef.current) {
                  scrollToBottom();
                }
              } else {
                clearInterval(streamInterval);
                setIsLoading(false);
                // Scroll to bottom when done
                if (shouldAutoScrollRef.current) {
                  scrollToBottom(true);
                }
              }
            }, 800); // Show each line every 800ms
          }, remaining);
        };
        
        checkAndStartResponse();
      } else {
        // Normal mode: Show full response immediately
        setIsLoading(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          tool_calls: data.tool_calls,
          timestamp: new Date(),
        }]);
        
        // Scroll to bottom after assistant responds (only if user is near bottom)
        scrollToBottom();
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      stopThinkingIndicator();
      setIsLoading(false);
      
      // Extract user-friendly error message from response
      let errorMessage = "I encountered an issue processing your request. Please try again.";
      
      try {
        // Try to parse error response if it's JSON
        if (error.response) {
          const errorData = await error.response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else if (error.message) {
          // Use the error message directly if it's user-friendly
          errorMessage = error.message;
        }
      } catch (e) {
        // If parsing fails, use default message
        errorMessage = error.message || errorMessage;
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
        isError: true,
      }]);
      
      // Scroll to bottom after error message
      scrollToBottom();
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
    <div className="flex flex-col bg-gray-50 overflow-hidden" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4 shadow-sm flex-shrink-0 z-10" style={{ flexShrink: 0 }}>
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
      <div
        ref={messagesContainerRef}
        className="overflow-y-auto px-4 sm:px-6 py-2 sm:py-3 overscroll-contain" 
        style={{ 
          flex: '1 1 auto',
          overflowY: 'auto',
          height: 0, // Force flex to calculate height properly
          minHeight: 0
        }}
        onScroll={() => {
          // Update auto-scroll preference based on scroll position
          shouldAutoScrollRef.current = isNearBottom();
        }}
      >
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 pb-4">
          
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
                {msg.tool_calls && msg.tool_calls.length > 0 && (() => {
                  // Extract tool names - handle both string arrays and object arrays
                  const toolNames = msg.tool_calls
                    .map(tool => {
                      if (typeof tool === 'string') return tool;
                      if (tool && typeof tool === 'object') return tool.name || tool.tool_name;
                      return null;
                    })
                    .filter(name => name && name !== 'undefined' && name !== 'null' && name.trim() !== ''); // Filter out invalid values
                  
                  // Format tool names and filter out any that return null
                  const formattedTools = toolNames
                    .map(toolName => formatToolName(toolName))
                    .filter(formatted => formatted !== null && formatted !== undefined && formatted.trim() !== '');
                  
                  // Only show if we have valid formatted tool names
                  if (formattedTools.length === 0) return null;
                  
                  return (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Sparkles size={12} />
                        What I did:
                      </p>
                      <div className="space-y-1">
                        {formattedTools.map((formattedTool, i) => (
                          <div
                            key={i}
                            className="text-xs bg-gray-100 rounded-lg px-3 py-1.5 font-medium text-gray-700"
                          >
                            {formattedTool}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Timestamp */}
                <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {/* Thinking indicator */}
          {isLoading && (DEMO_MODE ? distributedPlatforms.length > 0 : thinkingMessages.length > 0) && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm max-w-[85%] sm:max-w-2xl">
                {DEMO_MODE ? (
                  <div className="space-y-1.5">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Distributing music to DSPs...
                    </div>
                    {distributedPlatforms.map((platform, idx) => (
                      <div 
                        key={idx}
                        className="text-sm text-gray-600 flex items-center gap-2 animate-fade-in"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <span className="text-green-500 font-bold">✓</span>
                        <span>{platform} - Music sent</span>
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>
      
      {/* Input - Fixed at bottom */}
      <div className="bg-white border-t px-4 sm:px-6 py-12 sm:py-15 flex-shrink-0 z-10 shadow-lg" style={{ flexShrink: 0 }}>
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
              onChange={(e) => {
                setInput(e.target.value);
                // Prevent auto-scroll while typing
                shouldAutoScrollRef.current = false;
              }}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              onFocus={() => {
                // Re-enable auto-scroll when input is focused (user is ready to send)
                shouldAutoScrollRef.current = isNearBottom();
              }}
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
  // Handle undefined/null/empty values
  if (!toolName || toolName === 'undefined' || toolName === 'null') {
    return null;
  }
  
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

