import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

const EarningsCharts = ({ earningsData, selectedCurrency, formatCurrency }) => {
  if (!earningsData) return null;

  const {
    platformBreakdown = [],
    monthlyBreakdown = [],
    revenueStreams = [],
  } = earningsData;

  // Platform Breakdown Pie Chart
  const platformChartData = {
    labels: platformBreakdown.map(platform => platform.platform),
    datasets: [
      {
        data: platformBreakdown.map(platform => parseFloat(platform.earnings || 0)),
        backgroundColor: [
          '#1DB954', // Spotify green
          '#000000', // Apple Music black
          '#FF0000', // YouTube red
          '#8B5CF6', // Other platforms purple
          '#06B6D4', // Additional platforms cyan
        ],
        borderColor: [
          '#1DB954',
          '#000000',
          '#FF0000',
          '#8B5CF6',
          '#06B6D4',
        ],
        borderWidth: 2,
      },
    ],
  };

  const platformChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${formatCurrency(value, selectedCurrency)} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Monthly Breakdown Bar Chart
  const monthlyChartData = {
    labels: monthlyBreakdown.map(month => month.month),
    datasets: [
      {
        label: 'Earnings',
        data: monthlyBreakdown.map(month => parseFloat(month.earnings || 0)),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Earnings: ${formatCurrency(context.parsed.y, selectedCurrency)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value, selectedCurrency);
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Revenue Streams Doughnut Chart
  const revenueChartData = {
    labels: revenueStreams.map(stream => stream.source),
    datasets: [
      {
        data: revenueStreams.map(stream => parseFloat(stream.amount || 0)),
        backgroundColor: [
          '#10B981', // Streaming green
          '#F59E0B', // Performance amber
          '#EF4444', // Sync red
          '#8B5CF6', // Other purple
        ],
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${formatCurrency(value, selectedCurrency)} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="space-y-8 mt-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          📊 Earnings Visualization
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Breakdown Pie Chart */}
          {platformBreakdown.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
              <h4 className="text-md font-semibold text-slate-800 mb-4 text-center">
                Platform Distribution
              </h4>
              <div style={{ height: '300px' }}>
                <Pie data={platformChartData} options={platformChartOptions} />
              </div>
            </div>
          )}

          {/* Revenue Streams Doughnut Chart */}
          {revenueStreams.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
              <h4 className="text-md font-semibold text-slate-800 mb-4 text-center">
                Revenue Sources
              </h4>
              <div style={{ height: '300px' }}>
                <Pie data={revenueChartData} options={revenueChartOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Monthly Trends Bar Chart */}
        {monthlyBreakdown.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <h4 className="text-md font-semibold text-slate-800 mb-4 text-center">
              Monthly Earnings Trend
            </h4>
            <div style={{ height: '300px' }}>
              <Bar data={monthlyChartData} options={monthlyChartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsCharts;
