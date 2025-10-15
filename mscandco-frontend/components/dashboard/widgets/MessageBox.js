/**
 * Message Box Widget
 * Displays announcements, alerts, and platform messages
 */

import { HiInformationCircle, HiExclamationTriangle, HiCheckCircle, HiMegaphone } from 'react-icons/hi2';

export default function MessageBox({ widget, config }) {
  const { messageSource, priority } = config;

  // Mock message - in production, fetch from API based on messageSource
  const mockMessages = {
    platform_messages: {
      title: 'Platform Update',
      content: 'We\'ve upgraded our servers for better performance. You may notice faster load times across the platform.',
      type: 'announcement',
      priority: priority || 'medium'
    },
    artist_messages: {
      title: 'New Feature: Advanced Analytics',
      content: 'Check out our new advanced analytics dashboard to get deeper insights into your audience and streaming patterns.',
      type: 'info',
      priority: priority || 'medium'
    }
  };

  const message = mockMessages[messageSource] || {
    title: widget.name,
    content: widget.description || 'No messages at this time.',
    type: 'info',
    priority: 'low'
  };

  const { bg, border, text, icon: IconComponent } = getMessageStyles(message.type);

  return (
    <div className={`${bg} ${border} rounded-lg p-6 border-l-4`}>
      <div className="flex items-start space-x-3">
        <IconComponent className={`w-6 h-6 ${text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${text} mb-2`}>{message.title}</h3>
          <p className={`text-sm ${text}`}>{message.content}</p>
          {message.priority === 'high' && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Important
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getMessageStyles(type) {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-900',
      icon: HiInformationCircle
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-900',
      icon: HiExclamationTriangle
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-900',
      icon: HiCheckCircle
    },
    announcement: {
      bg: 'bg-purple-50',
      border: 'border-purple-400',
      text: 'text-purple-900',
      icon: HiMegaphone
    }
  };

  return styles[type] || styles.info;
}
