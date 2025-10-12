import { useState } from 'react';
import { Calendar } from 'lucide-react';

/**
 * DateRangeSelector - Reusable date range selector with custom range option
 * Single source of truth for date ranges across the platform
 */

export const DATE_RANGE_PRESETS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '180', label: 'Last 6 months' },
  { value: '365', label: 'Last year' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom range' }
];

export function DateRangeSelector({
  value,
  onChange,
  showCustom = true,
  className = ''
}) {
  const [showCustomRange, setShowCustomRange] = useState(value === 'custom');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const handlePresetChange = (newValue) => {
    if (newValue === 'custom') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
      onChange(newValue, null, null);
    }
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      onChange('custom', customStartDate, customEndDate);
    }
  };

  const presets = showCustom ? DATE_RANGE_PRESETS : DATE_RANGE_PRESETS.filter(p => p.value !== 'custom');

  return (
    <div className={`${className}`}>
      <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 border border-gray-200">
        <Calendar size={18} className="text-gray-600" />
        <select
          value={showCustomRange ? 'custom' : value}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="text-sm font-medium focus:outline-none bg-transparent"
        >
          {presets.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {showCustomRange && (
        <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex flex-col space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleCustomApply}
              disabled={!customStartDate || !customEndDate}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Custom Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Calculate date range from preset value
 */
export function getDateRangeFromPreset(preset, customStart = null, customEnd = null) {
  if (preset === 'custom') {
    return {
      start: customStart ? new Date(customStart) : null,
      end: customEnd ? new Date(customEnd) : null
    };
  }

  if (preset === 'all') {
    return {
      start: null,
      end: null
    };
  }

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - parseInt(preset));

  return { start, end };
}

/**
 * Format date range for display
 */
export function formatDateRange(preset, customStart = null, customEnd = null) {
  if (preset === 'custom' && customStart && customEnd) {
    return `${new Date(customStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(customEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }

  const presetObj = DATE_RANGE_PRESETS.find(p => p.value === preset);
  return presetObj?.label || 'Unknown range';
}
