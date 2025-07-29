import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { 
  Music, 
  Globe, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Award, 
  Play,
  BarChart3,
  DollarSign,
  Headphones,
  Mic,
  Disc3,
  Radio,
  Smartphone,
  Monitor,
  Cloud,
  Lock,
  Star,
  Heart
} from 'lucide-react';

export default function About() {
  const { isAuthenticated, user } = useAuth0();
  const [activeSection, setActiveSection] = useState('mission');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: Music, value: '10M+', label: 'Tracks Distributed' },
    { icon: Users, value: '50K+', label: 'Artists Worldwide' },
    { icon: Globe, value: '150+', label: 'Countries Reached' },
    { icon: TrendingUp, value: '$2B+', label: 'Revenue Generated' }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Distribution',
      description: 'Get your music on all major platforms within 24 hours with our AI-powered distribution system.'
    },
    {
      icon: Shield,
      title: 'Advanced Rights Protection',
      description: 'Blockchain-verified copyright protection and automated rights management for your music.'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Comprehensive insights into your music performance across all platforms with predictive analytics.'
    },
    {
      icon: DollarSign,
      title: 'Smart Revenue Optimization',
      description: 'AI-driven pricing and placement strategies to maximize your earnings potential.'
    },
    {
      icon: Headphones,
      title: 'Multi-Platform Sync',
      description: 'Seamless synchronization across Spotify, Apple Music, TikTok, and 200+ other platforms.'
    },
    {
      icon: Cloud,
      title: 'Cloud-Native Architecture',
      description: 'Built on cutting-edge cloud infrastructure for 99.9% uptime and global scalability.'
    }
  ];

  const team = [
    {
      name: 'Alex Chen',
      role: 'CEO & Founder',
      bio: 'Former Spotify executive with 15+ years in music tech. Led distribution for 3 Grammy-winning artists.',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Sarah Rodriguez',
      role: 'CTO',
      bio: 'Ex-Google engineer specializing in AI/ML. Built recommendation systems used by 100M+ users.',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Marcus Johnson',
      role: 'Head of Artist Relations',
      bio: 'Music industry veteran with connections to major labels. Helped launch 50+ platinum artists.',
      image: '/api/placeholder/200/200'
    },
    {
      name: 'Dr. Emily Zhang',
      role: 'VP of AI & Analytics',
      bio: 'PhD in Machine Learning from MIT. Pioneered AI algorithms for music discovery and trend prediction.',
      image: '/api/placeholder/200/200'
    }
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Platform Foundation',
      description: 'Launched with revolutionary AI-powered distribution technology'
    },
    {
      year: '2021',
      title: 'Global Expansion',
      description: 'Reached 50+ countries and 1M+ artists worldwide'
    },
    {
      year: '2022',
      title: 'AI Breakthrough',
      description: 'Introduced predictive analytics and automated rights management'
    },
    {
      year: '2023',
      title: 'Industry Recognition',
      description: 'Named "Platform of the Year" by Music Tech Awards'
    },
    {
      year: '2024',
      title: 'Future Vision',
      description: 'Launching next-generation features including VR concerts and AI composers'
    }
  ];

  return (
    <MainLayout>
      <SEO pageTitle="About - The Future of Music Distribution" />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
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
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              The Future of Music
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-4xl mx-auto">
              We're not just distributing music. We're revolutionizing how artists connect with the world, 
              powered by cutting-edge AI and blockchain technology.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="w-8 h-8 text-purple-300 mr-2" />
                    <span className="text-3xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              To democratize music distribution and empower every artist with the tools, 
              technology, and reach that were once reserved for major labels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Building the Platform of Tomorrow
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                In a world where music moves at the speed of thought, we've created a platform 
                that doesn't just keep up—it leads the way. Our AI-powered distribution system 
                ensures your music reaches every corner of the digital universe instantly.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                But we're not stopping there. We're pioneering the next generation of music technology: 
                from AI composers that understand your style, to VR concerts that bring your audience 
                closer than ever before.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium">Industry Leader</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">Artist First</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Innovation Driven</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-8 text-white">
                <h4 className="text-2xl font-bold mb-4">Why We're Different</h4>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Award className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                    <span>First platform to use AI for predictive analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                    <span>Blockchain-verified copyright protection</span>
                  </li>
                  <li className="flex items-start">
                    <Globe className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                    <span>Global distribution in under 24 hours</span>
                  </li>
                  <li className="flex items-start">
                    <TrendingUp className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                    <span>Real-time revenue optimization</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Cutting-Edge Technology</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines the latest in AI, blockchain, and cloud computing 
              to deliver an experience that's years ahead of the competition.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From startup to industry leader, we've been at the forefront of music technology innovation.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-purple-500 to-blue-600"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-1/2 px-8">
                    <div className={`bg-white rounded-2xl p-6 shadow-lg ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="text-3xl font-bold text-purple-600 mb-2">{item.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-1/2 px-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The brilliant minds behind the platform that's changing the music industry forever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{member.name}</h3>
                <p className="text-purple-600 text-center mb-4 font-medium">{member.role}</p>
                <p className="text-gray-600 text-center text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="max-w-4xl mx-auto text-center text-white px-4">
          <h2 className="text-5xl font-bold mb-6">Ready to Shape the Future?</h2>
          <p className="text-xl mb-8 text-gray-200">
            Join thousands of artists who are already using the most advanced music distribution platform in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
              Start Your Journey
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-900 transition-colors">
              Learn More
            </button>
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