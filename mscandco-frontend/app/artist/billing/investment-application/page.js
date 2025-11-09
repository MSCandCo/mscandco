'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/SupabaseProvider';
import {
  Building2,
  ArrowLeft,
  Check,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Mail,
  Phone,
  FileText,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function InvestmentApplicationPage() {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    company: '',
    investmentAmount: '',
    customAmount: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const investmentTiers = [
    {
      amount: '£10,000',
      equity: '0.5%',
      description: 'Entry-level partnership with basic benefits'
    },
    {
      amount: '£25,000',
      equity: '1.0%',
      description: 'Mid-tier partnership with enhanced benefits'
    },
    {
      amount: '£50,000',
      equity: '2.0%',
      description: 'Premium partnership with maximum benefits'
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Equity Stake',
      description: 'Own a percentage of MSC & Co and benefit from company growth'
    },
    {
      icon: DollarSign,
      title: 'Revenue Share',
      description: 'Receive a share of platform revenue based on your investment tier'
    },
    {
      icon: Users,
      title: 'Strategic Input',
      description: 'Have a voice in company direction and product development'
    },
    {
      icon: Star,
      title: 'Priority Access',
      description: 'Early access to new features and exclusive opportunities'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare submission data
      const submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        investmentAmount: formData.investmentAmount === 'custom' 
          ? `custom_${formData.customAmount}` 
          : formData.investmentAmount,
        message: formData.message
      };

      // Validate custom amount if selected
      if (formData.investmentAmount === 'custom') {
        if (!formData.customAmount || parseFloat(formData.customAmount) < 1000) {
          throw new Error('Please enter a custom amount of at least £1,000');
        }
      }

      const response = await fetch('/api/investment/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      const result = await response.json();
      
      if (result.success) {
        setSubmitted(true);
      } else {
        throw new Error(result.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(`Failed to submit application: ${error.message}. Please try again or contact us directly at invest@mscandco.com`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in becoming an Investment Partner. We've received your application and will review it shortly.
            </p>
            <p className="text-gray-600 mb-8">
              Our team will contact you within 2-3 business days to discuss next steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/artist/billing')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Back to Billing
              </button>
              <a
                href="mailto:invest@mscandco.com"
                className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Us Directly
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Billing
          </button>
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investment Partner Program</h1>
              <p className="text-gray-600 mt-1">Join MSC & Co as an Investment Partner</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Introduction */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Invest in MSC & Co?</h2>
              <p className="text-gray-600 mb-4">
                MSC & Co is revolutionizing music distribution with AI-powered tools, fair pricing, and a focus on artist success. 
                As an Investment Partner, you'll own equity in a fast-growing platform that's changing how artists distribute and monetize their music.
              </p>
              <p className="text-gray-600">
                We're looking for strategic partners who share our vision of empowering artists and building the future of music distribution.
              </p>
            </div>

            {/* Investment Tiers */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Tiers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {investmentTiers.map((tier, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-yellow-500 transition-colors"
                  >
                    <div className="text-2xl font-bold text-gray-900 mb-2">{tier.amount}</div>
                    <div className="text-lg font-semibold text-yellow-600 mb-2">{tier.equity} Equity</div>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Partnership Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Form */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply Now</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount Interest *
                  </label>
                  <select
                    id="investmentAmount"
                    name="investmentAmount"
                    required
                    value={formData.investmentAmount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Select an amount</option>
                    <option value="10000">£10,000 (0.5% equity)</option>
                    <option value="25000">£25,000 (1.0% equity)</option>
                    <option value="50000">£50,000 (2.0% equity)</option>
                    <option value="custom">Custom Amount</option>
                  </select>
                  
                  {formData.investmentAmount === 'custom' && (
                    <div className="mt-4">
                      <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Custom Amount (GBP) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">£</span>
                        <input
                          type="number"
                          id="customAmount"
                          name="customAmount"
                          required={formData.investmentAmount === 'custom'}
                          value={formData.customAmount}
                          onChange={handleChange}
                          min="1000"
                          step="1000"
                          placeholder="Enter amount"
                          className="w-full pl-6 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm sm:text-base"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Minimum investment: £1,000</p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Tell Us About Yourself *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Why are you interested in investing? What value can you bring to MSC & Co?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <strong>Note:</strong> This is an initial application. Our team will review your submission and contact you 
                    to discuss terms, due diligence, and next steps. All investments are subject to approval and legal review.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-4">
                <a
                  href="mailto:invest@mscandco.com"
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  invest@mscandco.com
                </a>
                <div className="flex items-center text-gray-600">
                  <FileText className="w-5 h-5 mr-3" />
                  <span>Due Diligence Materials Available</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">What Happens Next?</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">1.</span>
                    <span>Submit your application</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">2.</span>
                    <span>We review within 2-3 business days</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">3.</span>
                    <span>Initial call to discuss your interest</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">4.</span>
                    <span>Due diligence and term negotiation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">5.</span>
                    <span>Legal review and investment completion</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

