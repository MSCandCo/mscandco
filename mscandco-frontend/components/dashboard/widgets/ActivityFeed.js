/**
 * Activity Feed Widget
 * Shows recent activities/events
 */

import { HiClock } from 'react-icons/hi2';

export default function ActivityFeed({ widget, config }) {
  // Mock activities
  const activities = [
    { id: 1, action: 'New release published', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'Payment processed', time: '5 hours ago', type: 'info' },
    { id: 3, action: 'Profile updated', time: '1 day ago', type: 'info' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.name}</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.action}</p>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <HiClock className="w-3 h-3 mr-1" />
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
