'use client';

/**
 * Touring Platform - Financial Tracking Dashboard
 * Expenses, revenue, and P&L tracking
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, DollarSign, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import CurrencySelector, { useCurrencySync, formatCurrency } from '@/components/shared/CurrencySelector';

export default function FinancialTrackingClient({ tourId, userId }) {
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [tourDates, setTourDates] = useState([]);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
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
        setTourDates(datesData.dates || []);
        let allRevenue = [];
        for (const date of datesData.dates) {
          const revRes = await fetch(`/api/touring/tour-dates/${date.id}/revenue`);
          const revData = await revRes.json();
          if (revData.success) {
            allRevenue = [...allRevenue, ...revData.revenue];
          }
        }
        setRevenue(allRevenue);
        
        // Calculate stats
        const totalExpenses = expensesData.total || 0;
        const totalRevenue = allRevenue.reduce((sum, rev) => sum + parseFloat(rev.amount || 0), 0);
        
        setStats({
          totalExpenses,
          totalRevenue,
          netProfit: totalRevenue - totalExpenses
        });
      }
    } catch (err) {
      console.error('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddRevenue = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dateId = formData.get('dateId');
    const source = formData.get('source');
    const amount = formData.get('amount');
    const description = formData.get('description');
    
    if (!dateId || !source || !amount) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const response = await fetch(`/api/touring/tour-dates/${dateId}/revenue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          amount: parseFloat(amount),
          description: description || null,
          recorded_by: userId
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add revenue');
      }
      
      setShowAddRevenue(false);
      fetchFinancialData();
    } catch (err) {
      console.error('Error adding revenue:', err);
      alert('Failed to add revenue: ' + err.message);
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
            <div className="flex items-center gap-4">
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                compact={true}
                showExchangeRate={true}
              />
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                <Plus size={18} />
                Add Expense
              </button>
            </div>
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
              {formatCurrency(stats.totalRevenue, selectedCurrency)}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(stats.totalExpenses, selectedCurrency)}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Net Profit</p>
              <DollarSign className={`w-5 h-5 ${stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
            <p className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netProfit, selectedCurrency)}
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
                      {formatCurrency(parseFloat(expense.amount), selectedCurrency)}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue</h2>
            <button 
              onClick={() => setShowAddRevenue(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
            >
              <Plus size={16} />
              Add Revenue
            </button>
          </div>
          
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
                    {formatCurrency(parseFloat(rev.amount), selectedCurrency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Revenue Modal */}
      {showAddRevenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Revenue</h2>
            <form onSubmit={handleAddRevenue}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tour Date *
                  </label>
                  <select
                    name="dateId"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a date</option>
                    {tourDates.map((date) => (
                      <option key={date.id} value={date.id}>
                        {new Date(date.date).toLocaleDateString()} - {date.city}, {date.country}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Source *
                  </label>
                  <select
                    name="source"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select source</option>
                    <option value="tickets">Tickets</option>
                    <option value="merch">Merchandise</option>
                    <option value="meet_greet">Meet & Greet</option>
                    <option value="guarantee">Guarantee</option>
                    <option value="sponsorship">Sponsorship</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount ({selectedCurrency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Optional description..."
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddRevenue(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Add Revenue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

