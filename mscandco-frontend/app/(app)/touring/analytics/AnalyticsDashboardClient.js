'use client';

/**
 * Touring Platform - Analytics Dashboard
 * AI-powered insights, predictions, and performance metrics
 */

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Sparkles, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import CurrencySelector, { useCurrencySync, formatCurrency } from '@/components/shared/CurrencySelector';

export default function AnalyticsDashboardClient({ userId }) {
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTours: 0,
    activeTours: 0,
    totalDates: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    avgAttendance: 0
  });
  
  useEffect(() => {
    fetchAnalytics();
  }, [userId]);
  
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all tours
      const response = await fetch(`/api/touring/tours?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setTours(data.tours || []);
        
        // Calculate stats
        const activeTours = data.tours.filter(t => t.status === 'active').length;
        let totalDates = 0;
        let totalRevenue = 0;
        let totalExpenses = 0;
        let totalAttendance = 0;
        let dateCount = 0;
        
        // Fetch dates for each tour
        for (const tour of data.tours) {
          const datesRes = await fetch(`/api/touring/tours/${tour.id}/dates`);
          const datesData = await datesRes.json();
          
          if (datesData.success) {
            totalDates += datesData.dates.length;
            
            datesData.dates.forEach(date => {
              if (date.revenue) totalRevenue += parseFloat(date.revenue);
              if (date.expenses) totalExpenses += parseFloat(date.expenses);
              if (date.actual_attendance) {
                totalAttendance += date.actual_attendance;
                dateCount++;
              }
            });
          }
        }
        
        setStats({
          totalTours: data.tours.length,
          activeTours,
          totalDates,
          totalRevenue,
          totalExpenses,
          avgAttendance: dateCount > 0 ? Math.round(totalAttendance / dateCount) : 0
        });
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const netProfit = stats.totalRevenue - stats.totalExpenses;
  const profitMargin = stats.totalRevenue > 0 ? ((netProfit / stats.totalRevenue) * 100).toFixed(1) : 0;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                Touring Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                compact={true}
                showExchangeRate={true}
              />
              <Link
                href="/touring"
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
              >
                Back to Tours
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue, selectedCurrency)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Across all tours</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <DollarSign className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.totalExpenses, selectedCurrency)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Across all tours</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Net Profit</p>
              {netProfit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit, selectedCurrency)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{profitMargin}% margin</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.avgAttendance.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Per show</p>
          </div>
        </div>
        
        {/* Tour Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Tour Performance</h2>
          
          {tours.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No tours yet</p>
              <Link href="/touring/tours/create" className="mt-4 inline-block text-blue-600 hover:underline">
                Create your first tour
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tours.map((tour) => (
                <Link
                  key={tour.id}
                  href={`/touring/tours/${tour.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{tour.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{tour.artist_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tour.status === 'active' ? 'bg-green-100 text-green-800' :
                        tour.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tour.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* AI Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
              <p className="text-sm text-gray-700 mb-4">
                Get intelligent recommendations for route optimization, venue selection, and tour planning.
              </p>
              <Link
                href="/ai/chat"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
                <Sparkles size={16} />
                Ask Apollo AI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

