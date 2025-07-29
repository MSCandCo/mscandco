import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Bot,
  Headphones,
  Mic,
  Disc3,
  Radio,
  Smartphone,
  Monitor,
  Cloud,
  Lock,
  Globe,
  TrendingUp,
  Award,
  Heart,
  BarChart3,
  Code
} from 'lucide-react';

export default function Support() {
  const { isAuthenticated, user } = useAuth0();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'distribution', name: 'Distribution', icon: Globe },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'billing', name: 'Billing', icon: Award },
    { id: 'technical', name: 'Technical', icon: Zap },
    { id: 'account', name: 'Account', icon: Users }
  ];

  const faqs = [
    {
      category: 'distribution',
      question: 'How fast is your distribution system?',
      answer: 'Our AI-powered distribution system gets your music on all major platforms within 24 hours. We use advanced algorithms to optimize delivery times and ensure maximum reach.',
      tags: ['speed', 'platforms', 'ai']
    },
    {
      category: 'analytics',
      question: 'What analytics do you provide?',
      answer: 'We offer comprehensive real-time analytics including streaming data, audience demographics, geographic performance, playlist placements, and predictive trend analysis.',
      tags: ['data', 'insights', 'trends']
    },
    {
      category: 'billing',
      question: 'How do I manage my subscription?',
      answer: 'You can manage your subscription through your dashboard. We offer flexible plans with no hidden fees and transparent pricing. Upgrade or downgrade anytime.',
      tags: ['pricing', 'subscription', 'billing']
    },
    {
      category: 'technical',
      question: 'What file formats do you support?',
      answer: 'We support all major audio formats including WAV, FLAC, MP3, and AIFF. Our system automatically optimizes your files for each platform\'s requirements.',
      tags: ['formats', 'quality', 'optimization']
    },
    {
      category: 'account',
      question: 'How do I protect my copyright?',
      answer: 'Our blockchain-verified copyright protection system automatically registers your music and provides legal documentation. We also offer automated rights management.',
      tags: ['copyright', 'legal', 'protection']
    },
    {
      category: 'distribution',
      question: 'Which platforms do you distribute to?',
      answer: 'We distribute to 200+ platforms including Spotify, Apple Music, TikTok, YouTube Music, Amazon Music, and all major streaming services worldwide.',
      tags: ['platforms', 'reach', 'global']
    }
  ];

  const supportTiers = [
    {
      name: 'Basic Support',
      description: 'Perfect for getting started',
      features: [
        'Email support within 24 hours',
        'Knowledge base access',
        'Community forum',
        'Basic troubleshooting'
      ],
      icon: HelpCircle,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Priority Support',
      description: 'For serious artists',
      features: [
        'Priority email support (4 hours)',
        'Live chat during business hours',
        'Video call support',
        'Advanced troubleshooting',
        'Custom onboarding'
      ],
      icon: Star,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Premium Support',
      description: 'For professional artists',
      features: [
        '24/7 dedicated support',
        'Personal account manager',
        'Phone support',
        'Custom training sessions',
        'Priority feature requests',
        'White-glove service'
      ],
      icon: Award,
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Complete walkthrough for new users',
      icon: BookOpen,
      type: 'guide',
      time: '10 min read'
    },
    {
      title: 'Distribution Best Practices',
      description: 'Maximize your reach and revenue',
      icon: TrendingUp,
      type: 'guide',
      time: '15 min read'
    },
    {
      title: 'Analytics Deep Dive',
      description: 'Understanding your data insights',
      icon: BarChart3,
      type: 'guide',
      time: '20 min read'
    },
    {
      title: 'API Documentation',
      description: 'Integrate with our platform',
      icon: Code,
      type: 'technical',
      time: '45 min read'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step visual guides',
      icon: Video,
      type: 'video',
      time: '5-15 min each'
    },
    {
      title: 'Case Studies',
      description: 'Success stories from artists',
      icon: Users,
      type: 'case-study',
      time: '10 min read'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    selectedCategory === 'all' || faq.category === selectedCategory
  ).filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <MainLayout>
      <SEO pageTitle="Support - 24/7 AI-Powered Help" />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center mb-8">
              <img 
                src="/logos/yhwh-msc-logo.png" 
                alt="YHWH MSC" 
                className="h-16 w-auto mr-6"
                onError={(e) => {
                  e.target.src = '/logos/yhwh-msc-logo.svg';
                }}
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              We're Here to Help
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-4xl mx-auto">
              Get instant answers with our AI-powered support system, or connect with our expert team 
              for personalized assistance.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help, tutorials, or contact support..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-gray-300">AI Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">&lt;2min</div>
                <div className="text-gray-300">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-gray-300">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-gray-300">Languages</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">AI-Powered Assistant</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get instant answers to your questions with our advanced AI that understands the music industry.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-full p-3 mr-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Ask Our AI Assistant</h3>
                <p className="text-gray-600">Available 24/7 in 50+ languages</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">Quick Questions</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• How do I upload my first track?</li>
                    <li>• What are the best release times?</li>
                    <li>• How do I read my analytics?</li>
                    <li>• What's the difference between plans?</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">Advanced Help</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• API integration support</li>
                    <li>• Custom distribution strategies</li>
                    <li>• Rights management advice</li>
                    <li>• Revenue optimization tips</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                Start Chat with AI
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to the most common questions about our platform.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <category.icon className="w-5 h-5 mr-2" />
                {category.name}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-6">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 mb-4">{faq.answer}</p>
                <div className="flex flex-wrap gap-2">
                  {faq.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Tiers */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Support Tiers</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the level of support that matches your needs and success.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {supportTiers.map((tier, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`bg-gradient-to-br ${tier.color} rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-6`}>
                  <tier.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Learning Resources</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master our platform with comprehensive guides, tutorials, and documentation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <resource.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{resource.time}</span>
                  <ChevronRight className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Need personalized help? Our expert team is ready to assist you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Get instant help from our support team</p>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Send us a detailed message</p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
                Send Email
              </button>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">Speak directly with our experts</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                Call Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </MainLayout>
  );
} 