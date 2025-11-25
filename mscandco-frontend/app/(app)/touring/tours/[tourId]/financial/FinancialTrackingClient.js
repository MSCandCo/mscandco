'use client';

/**
 * Touring Platform - Financial Tracking Dashboard
 * Expenses, revenue, and P&L tracking
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, DollarSign, TrendingUp, TrendingDown, Receipt } from 'lucide-react';

export default function FinancialTrackingClient({ tourId, userId }) {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalRevenue: 0,
    netProfit: 0
  });
  
  useEffect(() => {
    fetchFinancialData();
  }, [tourId]);
  
  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Fetch expenses
      const expensesRes = await fetch(`/api/touring/tours/${tourId}/expenses`);
      const expensesData = await expensesRes.json();
      
      if (expensesData.success) {
        setExpenses(expensesData.expenses || []);
      }
      
      // Fetch revenue from all dates
      const datesRes = await fetch(`/api/touring/tours/${tourId}/dates`);
      const datesData = await datesRes.json();
      
      if (datesData.success) {
        let allRevenue = [];
        for (const date of datesData.dates) {
          const revRes = await fetch(`/api/touring/tour-dates/${date.id}/revenue`);
          const revData = await revRes.json();
          if (revData.success) {
            allRevenue = [...allRevenue, ...revData.revenue];
          }
        }
        setRevenue(allRevenue);
      }
      
      // Calculate stats
      const totalExpenses = expensesData.total || 0;
      const totalRevenue = revenue.reduce((sum, rev) => sum + parseFloat(rev.amount || 0), 0);
      
      setStats({
        totalExpenses,
        totalRevenue,
        netProfit: totalRevenue - totalExpenses
      });
    } catch (err) {
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const getCategoryColor = (category) => {
    const colors = {
      travel: 'bg-blue-100 text-blue-800',
      hotel: 'bg-purple-100 text-purple-800',
      food: 'bg-orange-100 text-orange-800',
      fuel: 'bg-yellow-100 text-yellow-800',
      equipment: 'bg-gray-100 text-gray-800',
      venue: 'bg-green-100 text-green-800',
      crew: 'bg-pink-100 text-pink-800',
      marketing: 'bg-indigo-100 text-indigo-800',
      misc: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.misc;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/touring/tours/${tourId}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Financial Tracking</h1>
                <p className="text-gray-600 mt-1">Track expenses and revenue</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              <Plus size={18} />
              Add Expense
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${stats.totalRevenue.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">
              ${stats.totalExpenses.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Net Profit</p>
              <DollarSign className={`w-5 h-5 ${stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <p className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${stats.netProfit.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Expenses</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm">
              <Plus size={16} />
              Add Expense
            </button>
          </div>
          
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No expenses recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                      <p className="font-semibold text-gray-900">{expense.description}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(expense.date).toLocaleDateString()} • {expense.vendor || 'No vendor'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      ${parseFloat(expense.amount).toLocaleString()}
                    </p>
                    <p className={`text-xs mt-1 ${
                      expense.status === 'approved' ? 'text-green-600' :
                      expense.status === 'pending' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {expense.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue</h2>
          
          {revenue.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No revenue recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {revenue.map((rev) => (
                <div key={rev.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        {rev.source}
                      </span>
                      <p className="font-semibold text-gray-900">{rev.description || 'Revenue'}</p>
                    </div>
                    {rev.received_at && (
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(rev.received_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    ${parseFloat(rev.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

