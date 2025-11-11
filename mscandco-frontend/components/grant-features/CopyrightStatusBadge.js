export default function CopyrightStatusBadge({ status }) {
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: '⏳',
      label: 'Pending',
    },
    processing: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '🔄',
      label: 'Processing',
    },
    clear: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: '✅',
      label: 'Clear',
    },
    potential_conflict: {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: '⚠️',
      label: 'Potential Conflict',
    },
    conflict_detected: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '❌',
      label: 'Conflict Detected',
    },
    manual_review_required: {
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '👁️',
      label: 'Manual Review Required',
    },
    failed: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '⚠️',
      label: 'Failed',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${config.color}`}
    >
      <span className="mr-2">{config.icon}</span>
      {config.label}
    </span>
  );
}
