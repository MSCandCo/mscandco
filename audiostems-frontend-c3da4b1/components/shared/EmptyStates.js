/**
 * Simple Empty State Components
 * No complex imports - just basic components
 */

// Generic empty state component
export const EmptyState = ({ 
  title = "No data yet", 
  description = "Data will appear here once added", 
  actionLabel = null, 
  onAction = null,
  className = ""
}) => (
  <div className={`text-center py-12 px-4 ${className}`}>
    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-4">
      <div className="text-4xl text-gray-400">📊</div>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        ➕ {actionLabel}
      </button>
    )}
  </div>
);

// Music releases empty state
export const EmptyReleases = ({ onAddRelease }) => (
  <EmptyState
    title="No releases yet"
    description="Upload your first music release to get started with distribution"
    actionLabel="Add Release"
    onAction={onAddRelease}
  />
);

// Analytics empty state
export const EmptyAnalytics = () => (
  <EmptyState
    title="No analytics data"
    description="Analytics will appear once your music is released and streamed"
  />
);

// Earnings empty state
export const EmptyEarnings = () => (
  <EmptyState
    title="No earnings yet"
    description="Earnings will appear here once your music starts generating revenue"
  />
);

// Artists empty state (for label admins)
export const EmptyArtists = ({ onAddArtist }) => (
  <EmptyState
    title="No artists signed"
    description="Add artists to your label to start managing their releases"
    actionLabel="Add Artist"
    onAction={onAddArtist}
  />
);

// Default export
export default EmptyState;