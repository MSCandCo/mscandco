'use client';

/**
 * Touring Platform - Reports Generator
 * Generate PDF reports for day sheets, set lists, guest lists
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, FileText, Users, Music, Calendar, FileSpreadsheet } from 'lucide-react';

export default function ReportsClient({ tourId, dateId, userId }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const generateReport = async (reportType, format = 'html') => {
    try {
      setGenerating(true);
      setError(null);
      
      let url = '';
      if (reportType === 'day-sheet') {
        url = `/api/touring/reports/day-sheet?tourDateId=${dateId}`;
      } else if (reportType === 'financial') {
        url = `/api/touring/reports/financial?tourId=${tourId}&format=${format}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }
      
      if (format === 'csv') {
        // Download CSV
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${reportType}-${dateId || tourId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } else {
        // Open HTML in new window for printing/PDF
        const newWindow = window.open('', '_blank');
        newWindow.document.write(data.html);
        newWindow.document.close();
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };
  
  const exportCalendar = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`/api/touring/calendar/export?tourDateId=${dateId}`);
      
      if (!response.ok) {
        throw new Error('Failed to export calendar');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `tour-date-${dateId}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Calendar export error:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/touring/tours/${tourId}/dates/${dateId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Exports</h1>
              <p className="text-gray-600 mt-1">Generate PDF reports and export data</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Day Sheet */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Day Sheet</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Complete day sheet with itinerary, crew, guest list, and set list
            </p>
            <button
              onClick={() => generateReport('day-sheet')}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download size={18} />
              {generating ? 'Generating...' : 'Generate PDF'}
            </button>
          </div>
          
          {/* Financial Report */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Financial Report</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Complete financial report with expenses, revenue, and P&L
            </p>
            <div className="space-y-2">
              <button
                onClick={() => generateReport('financial', 'html')}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
              >
                <FileText size={16} />
                PDF Report
              </button>
              <button
                onClick={() => generateReport('financial', 'csv')}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
              >
                <FileSpreadsheet size={16} />
                Export CSV
              </button>
            </div>
          </div>
          
          {/* Calendar Export */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Calendar Export</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Export tour date to Google Calendar, Apple Calendar, or Outlook
            </p>
            <button
              onClick={exportCalendar}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Download size={18} />
              {generating ? 'Exporting...' : 'Export iCal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

