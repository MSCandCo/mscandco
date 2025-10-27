'use client';

/**
 * Apollo Intelligence - Landing Page
 * Introduction to AI-powered music distribution
 */

import { useUser } from '@/components/providers/SupabaseProvider';
import { Sparkles, MessageSquare, TrendingUp, DollarSign, Calendar, Zap, ArrowRight, Music } from 'lucide-react';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ApolloAILandingPage() {
  const { user } = useUser();
  const router = useRouter();
  
  if (!user) {
    return <PageLoading message="Loading..." />;
  }
  
  const features = [
    {
      icon: MessageSquare,
      title: 'Natural Conversation',
      description: 'Talk to Apollo like a colleague. Ask questions in plain English and get instant, intelligent answers.',
      color: 'from-gray-800 to-gray-900',
    },
    {
      icon: DollarSign,
      title: 'Earnings Intelligence',
      description: 'Ask "Which platform pays me the most?" and get detailed breakdowns with insights and recommendations.',
      color: 'from-green-600 to-green-700',
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Understand your music\'s performance with Apollo-powered insights and trend analysis.',
      color: 'from-purple-600 to-purple-700',
    },
    {
      icon: Calendar,
      title: 'Release Strategy',
      description: 'Get data-driven recommendations on when to release your music for maximum impact.',
      color: 'from-orange-600 to-orange-700',
    },
    {
      icon: Zap,
      title: 'Instant Actions',
      description: 'Request payouts, create releases, and manage your account - all through conversation.',
      color: 'from-pink-600 to-pink-700',
    },
    {
      icon: Sparkles,
      title: 'Voice Control',
      description: 'Use voice input to interact hands-free. Perfect for when you\'re in the studio or on the go.',
      color: 'from-indigo-600 to-indigo-700',
    },
  ];
  
  const examples = [
    {
      question: "Which platform pays me the most?",
      answer: "Spotify is your top earner at £847 this month (62%), followed by Apple Music at £312 (23%). Your Spotify performance is really strong! 📈",
    },
    {
      question: "When should I release my new single?",
      answer: "Based on gospel music trends, I recommend Friday, March 15th. Friday releases perform 23% better, and this gives you 2 weeks for promotion.",
    },
    {
      question: "Show me my wallet balance",
      answer: "You have £1,247.89 available to withdraw right now, plus £432.12 pending from recent streams. Want to request a payout? 💰",
    },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b">
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-full shadow-2xl mb-6">
              <Music className="w-10 h-10 text-white" />
            </div>
            
            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
              Apollo Intelligence
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The world's first Apollo-powered assistant for music distribution.
              <br />
              Talk to your platform. Get instant insights. Make smarter decisions.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push('/ai/chat')}
                className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold text-lg hover:bg-gray-800 hover:shadow-2xl transition-all flex items-center gap-2 group"
              >
                Start Chatting with Apollo
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg hover:shadow-lg transition-all border-2 border-gray-900"
              >
                Use Regular Version
              </Link>
            </div>
          </div>
          
          {/* Chat Interface Preview */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gray-900 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Apollo AI</h3>
                  <p className="text-sm text-gray-400">Your music distribution assistant</p>
                </div>
              </div>
              
              {/* Chat Messages Preview */}
              <div className="bg-gray-50 p-6 space-y-4 min-h-[400px]">
                {/* Apollo Message */}
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm max-w-2xl">
                    <p className="text-gray-700">
                      Hey! 👋 I'm Apollo, your music intelligence assistant. How can I help you today?
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Just now</p>
                  </div>
                </div>
                
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-gray-900 text-white rounded-2xl px-6 py-4 shadow-sm max-w-2xl">
                    <p>Which platform pays me the most?</p>
                    <p className="text-xs text-gray-400 mt-2">Just now</p>
                  </div>
                </div>
                
                {/* Apollo Response */}
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm max-w-2xl">
                    <p className="text-gray-700">
                      Spotify is your top earner at £847 this month (62%), followed by Apple Music at £312 (23%). Your Spotify performance is really strong! 📈
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Sparkles size={12} />
                        Actions taken:
                      </p>
                      <div className="text-xs bg-gray-100 rounded-lg px-3 py-1.5 font-medium text-gray-700">
                        📊 Analyzed earnings
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Just now</p>
                  </div>
                </div>
                
                {/* Input Preview */}
                <div className="pt-4">
                  <div className="flex space-x-3">
                    <div className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-400">
                      Ask me anything...
                    </div>
                    <button className="px-6 py-3 bg-gray-900 text-white rounded-xl">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          What Can Apollo Do?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Example Conversations */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          See Apollo in Action
        </h2>
        
        <div className="space-y-6">
          {examples.map((example, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* User Question */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <p className="text-white font-medium">{example.question}</p>
              </div>
              
              {/* Apollo Answer */}
              <div className="p-4 bg-gray-50">
                <p className="text-gray-700">{example.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/ai/chat')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transition-all inline-flex items-center gap-2"
          >
            Try It Yourself
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Ask Anything</h3>
            <p className="text-gray-600">
              Type or speak your question naturally. No need to learn commands or navigate menus.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Apollo Analyzes</h3>
            <p className="text-gray-600">
              Apollo understands your question, accesses your real data, and analyzes it instantly.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-pink-600">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Get Insights</h3>
            <p className="text-gray-600">
              Receive clear answers with actionable insights and recommendations.
            </p>
          </div>
        </div>
      </div>
      
      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-gray-900 rounded-2xl p-12 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the revolution in music distribution. Start chatting with Apollo now.
          </p>
          <button
            onClick={() => router.push('/ai/chat')}
            className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all inline-flex items-center gap-2"
          >
            Launch Apollo Intelligence
            <Sparkles size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

