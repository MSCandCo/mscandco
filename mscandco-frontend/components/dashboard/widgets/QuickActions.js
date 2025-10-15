/**
 * Quick Actions Widget
 * Displays quick action buttons
 */

import { HiPlus, HiChartBar, HiCurrencyDollar, HiUserCircle } from 'react-icons/hi2';

export default function QuickActions({ widget, config }) {
  const actions = [
    { icon: HiPlus, label: 'New Release', color: 'blue' },
    { icon: HiChartBar, label: 'Analytics', color: 'green' },
    { icon: HiCurrencyDollar, label: 'Earnings', color: 'yellow' },
    { icon: HiUserCircle, label: 'Profile', color: 'purple' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.name}</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <action.icon className="w-6 h-6 text-gray-700 mb-2" />
            <span className="text-xs text-gray-600 text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
