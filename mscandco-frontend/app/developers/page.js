'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/navigation';
import { Code, Key, Book, Zap, Globe, Shield, TrendingUp, Copy, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DevelopersPage() {
  const { user } = useUser();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
              <Code className="w-4 h-4" />
              <span className="text-sm font-medium">MSC & Co Developer Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Build the Future of Music Distribution
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              Access our powerful API to build apps, integrations, and tools on top of the world's most advanced music platform. 
              From analytics dashboards to automation tools, the possibilities are endless.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {user ? (
                <>
                  <Link href="/developers/keys">
                    <button className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Get API Keys
                    </button>
                  </Link>
                  <Link href="/developers/docs">
                    <button className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                      <Book className="w-5 h-5" />
                      View Docs
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => router.push('/login')}
                    className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                  >
                    Sign In to Get Started
                  </button>
                  <Link href="/developers/docs">
                    <button className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                      <Book className="w-5 h-5" />
                      Browse Docs
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Build with MSC & Co?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our API gives you programmatic access to everything - releases, earnings, analytics, and more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
            <p className="text-gray-600">
              Sub-100ms response times globally. Built on modern infrastructure for maximum performance.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise Security</h3>
            <p className="text-gray-600">
              SHA-256 key encryption, rate limiting, and comprehensive audit logs for every request.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Global CDN</h3>
            <p className="text-gray-600">
              Edge-cached responses from servers around the world. Fast for your users, everywhere.
            </p>
          </div>
        </div>

        {/* Quick Start Example */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Quick Start Example</h3>
            <button
              onClick={() => copyToClipboard(sampleCode)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
            <code>{sampleCode}</code>
          </pre>
        </div>

        {/* API Endpoints */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Available Endpoints</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-2 ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                      endpoint.method === 'PATCH' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {endpoint.method}
                    </span>
                    <h4 className="text-lg font-bold text-gray-900">{endpoint.path}</h4>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{endpoint.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  <span>Requires: {endpoint.scope}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 border border-gray-200">
          <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">Simple, Transparent Pricing</h3>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`bg-white rounded-2xl p-8 border-2 ${
                tier.popular ? 'border-gray-900 shadow-xl' : 'border-gray-200'
              } relative`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h4>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  {tier.period && <span className="text-gray-600">/{tier.period}</span>}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {user ? (
                  <Link href="/developers/keys">
                    <button className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      tier.popular
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}>
                      Get Started
                    </button>
                  </Link>
                ) : (
                  <button 
                    onClick={() => router.push('/login')}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      tier.popular
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Sign In to Get Started
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Building?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join developers building the future of music technology
          </p>
          {user ? (
            <Link href="/developers/keys">
              <button className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all inline-flex items-center gap-2">
                <Key className="w-5 h-5" />
                Generate Your First API Key
              </button>
            </Link>
          ) : (
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all"
            >
              Create Account & Get API Key
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Sample code for quick start
const sampleCode = `// Get your releases via MSC & Co API
const response = await fetch('https://mscandco.com/api/v1/releases', {
  headers: {
    'Authorization': 'Bearer msc_live_your_api_key_here'
  }
});

const data = await response.json();
console.log(data.data); // Your releases

// Create a new release
const newRelease = await fetch('https://mscandco.com/api/v1/releases', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer msc_live_your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Summer Vibes',
    release_type: 'single',
    genre: 'Hip-Hop'
  })
});`;

// API endpoints
const apiEndpoints = [
  {
    method: 'GET',
    path: '/api/v1/releases',
    description: 'Get all your music releases with pagination',
    scope: 'read',
  },
  {
    method: 'POST',
    path: '/api/v1/releases',
    description: 'Create a new draft release',
    scope: 'write',
  },
  {
    method: 'GET',
    path: '/api/v1/earnings',
    description: 'Get earnings summary by platform and timeframe',
    scope: 'read',
  },
  {
    method: 'GET',
    path: '/api/v1/analytics',
    description: 'Get streaming analytics and performance metrics',
    scope: 'read',
  },
  {
    method: 'GET',
    path: '/api/v1/profile',
    description: 'Get artist profile information',
    scope: 'read',
  },
  {
    method: 'GET',
    path: '/api/v1/notifications',
    description: 'Get recent notifications and updates',
    scope: 'read',
  },
];

// Pricing tiers
const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    features: [
      '1,000 requests/month',
      'Read-only access',
      'Community support',
      'Basic rate limiting',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    period: 'month',
    popular: true,
    features: [
      '50,000 requests/month',
      'Read & write access',
      'Email support',
      'Webhooks',
      'Priority rate limits',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Unlimited requests',
      'Full API access',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
    ],
  },
];

