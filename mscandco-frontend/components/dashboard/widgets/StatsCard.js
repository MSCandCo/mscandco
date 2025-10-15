/**
 * Stats Card Widget
 * Displays a single metric with icon, value, and optional trend
 */

import { useState, useEffect } from 'react';
import { HiUsers, HiCurrencyDollar, HiMusicalNote, HiStar, HiPlayCircle } from 'react-icons/hi2';

export default function StatsCard({ widget, config }) {
  const { metric, icon, color, format } = config;
  const [data, setData] = useState({ value: 0, change: 0, label: widget.name });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetric() {
      try {
        const response = await fetch(`/api/dashboard/stats/${metric}`);
        if (response.ok) {
          const metricData = await response.json();
          setData(metricData);
        }
      } catch (error) {
        console.error(`Error fetching metric ${metric}:`, error);
      } finally {
        setLoading(false);
      }
    }

    if (metric) {
      fetchMetric();
    } else {
      setLoading(false);
    }
  }, [metric]);

  const IconComponent = getIcon(icon);
  const colorClasses = getColorClasses(color);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{data.label}</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatValue(data.value, format)}
          </p>
          {data.change !== 0 && (
            <p className={`text-sm mt-2 flex items-center ${
              data.change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="mr-1">
                {data.change > 0 ? '↑' : '↓'}
              </span>
              {Math.abs(data.change)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
          <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
        </div>
      </div>
    </div>
  );
}

function getIcon(iconName) {
  const icons = {
    users: HiUsers,
    dollar: HiCurrencyDollar,
    music: HiMusicalNote,
    star: HiStar,
    play: HiPlayCircle
  };
  return icons[iconName] || HiStar;
}

function getColorClasses(color) {
  const colors = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' }
  };
  return colors[color] || colors.blue;
}

function formatValue(value, format) {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  return new Intl.NumberFormat('en-US').format(value);
}
