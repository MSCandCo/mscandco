'use client'

// 🎯 SHARED STATS CARD COMPONENT
// Eliminates duplicate stats display code across all dashboards

import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from './CurrencySelector';

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'percentage', // 'percentage', 'absolute', 'none'
  icon: Icon, 
  color = 'blue',
  size = 'normal', // 'small', 'normal', 'large'
  format = 'number', // 'number', 'currency', 'percentage'
  currency = 'GBP',
  loading = false,
  onClick = null
}) {
  const formatValue = (val) => {
    if (loading) return '...';
    if (val === null || val === undefined) return '0';
    
    switch (format) {
      case 'currency':
        return formatCurrency(val, currency);
      case 'percentage':
        if (isNaN(val) || val === null || val === undefined) return '---%';
        return `${val.toFixed(1)}%`;
      case 'number':
      default:
        if (isNaN(val) || val === null || val === undefined) return '---';
        return val.toLocaleString();
    }
  };

  const getChangeColor = () => {
    if (!change || change === 0) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = () => {
    if (!change || change === 0) return <Minus className="w-3 h-3" />;
    return change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  const getColorClasses = () => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      pink: 'bg-pink-50 text-pink-600 border-pink-200',
      gray: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    return colors[color] || colors.blue;
  };

  const getSizeClasses = () => {
    const sizes = {
      small: 'p-3',
      normal: 'p-4',
      large: 'p-6'
    };
    return sizes[size] || sizes.normal;
  };

  const getValueSize = () => {
    const sizes = {
      small: 'text-lg',
      normal: 'text-2xl',
      large: 'text-3xl'
    };
    return sizes[size] || sizes.normal;
  };

  const getTitleSize = () => {
    const sizes = {
      small: 'text-xs',
      normal: 'text-sm',
      large: 'text-base'
    };
    return sizes[size] || sizes.normal;
  };

  const cardContent = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${getTitleSize()} font-medium text-gray-600 mb-1`}>
            {title}
          </p>
          <p className={`${getValueSize()} font-bold text-gray-900`}>
            {formatValue(value)}
          </p>
          {change !== undefined && changeType !== 'none' && (
            <div className={`flex items-center space-x-1 mt-1 ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="text-xs font-medium">
                {changeType === 'percentage' ? 
                  (isNaN(change) ? '---%' : `${Math.abs(change).toFixed(1)}%`) : 
                  (isNaN(change) ? '---' : Math.abs(change).toLocaleString())
                }
                {changeType === 'percentage' ? '' : ` ${change > 0 ? 'more' : 'less'}`}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${getColorClasses()}`}>
            <Icon className={size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} />
          </div>
        )}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 text-left w-full ${getSizeClasses()}`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${getSizeClasses()}`}>
      {cardContent}
    </div>
  );
}

// 📊 Pre-configured stat card variants for common use cases
export function EarningsCard({ earnings, change, currency = 'GBP', size = 'normal' }) {
  return (
    <StatsCard
      title="Total Earnings"
      value={earnings}
      change={change}
      format="currency"
      currency={currency}
      color="green"
      size={size}
      icon={({ className }) => <span className={className}>💰</span>}
    />
  );
}

export function StreamsCard({ streams, change, size = 'normal' }) {
  return (
    <StatsCard
      title="Total Streams"
      value={streams}
      change={change}
      format="number"
      color="blue"
      size={size}
      icon={({ className }) => <span className={className}>🎵</span>}
    />
  );
}

export function ReleasesCard({ releases, change, size = 'normal' }) {
  return (
    <StatsCard
      title="Total Releases"
      value={releases}
      change={change}
      format="number"
      color="purple"
      size={size}
      icon={({ className }) => <span className={className}>🎼</span>}
    />
  );
}

export function ArtistsCard({ artists, change, size = 'normal' }) {
  return (
    <StatsCard
      title="Total Artists"
      value={artists}
      change={change}
      format="number"
      color="indigo"
      size={size}
      icon={({ className }) => <span className={className}>🎤</span>}
    />
  );
}

export function ConversionCard({ rate, change, size = 'normal' }) {
  return (
    <StatsCard
      title="Conversion Rate"
      value={rate}
      change={change}
      format="percentage"
      color="yellow"
      size={size}
      icon={({ className }) => <span className={className}>📈</span>}
    />
  );
}