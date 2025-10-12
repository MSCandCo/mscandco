/**
 * Empty State Components
 * Graceful empty states for when no data exists yet
 */

import { FaMusic, FaUsers, FaChartBar, FaUpload, FaPlus } from 'react-icons/fa';
import { HiDocumentAdd, HiUserAdd, HiMusicNote } from 'react-icons/hi';

// Generic empty state component
export const EmptyState = ({ 
  icon: Icon = FaMusic, 
  title = "No data yet", 
  description = "Data will appear here once added", 
  actionLabel = null, 
  onAction = null,
  className = ""
}) => (
  <div className={`text-center py-12 px-4 ${className}`}>
    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-4">
      <Icon className="h-12 w-12 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FaPlus className="mr-2 h-4 w-4" />
        {actionLabel}
      </button>
    )}
  </div>
);

// Specific empty states for different sections
export const EmptyArtists = ({ onAddArtist = null }) => (
  <EmptyState
    icon={HiUserAdd}
    title="No artists added yet"
    description="Start building your roster by adding your first artist. You can manage their releases, analytics, and earnings from here."
    actionLabel={onAddArtist ? "Add First Artist" : null}
    onAction={onAddArtist}
  />
);

export const EmptyReleases = ({ onCreateRelease = null, userRole = 'artist' }) => {
  const roleMessages = {
    artist: {
      title: "No releases yet",
      description: "Ready to share your music with the world? Create your first release and start distributing to all major platforms."
    },
    label_admin: {
      title: "No releases found",
      description: "Manage and oversee releases from your artists. Track performance and handle distribution across platforms."
    },
    company_admin: {
      title: "No content available",
      description: "Monitor all releases across the platform. Review content and track overall performance metrics."
    }
  };

  const message = roleMessages[userRole] || roleMessages.artist;

  return (
    <EmptyState
      icon={HiDocumentAdd}
      title={message.title}
      description={message.description}
      actionLabel={onCreateRelease && userRole === 'artist' ? "Create First Release" : null}
      onAction={onCreateRelease}
    />
  );
};

export const EmptyTracks = ({ onAddTrack = null }) => (
  <EmptyState
    icon={HiMusicNote}
    title="Add your first track"
    description="Upload your music and start building your catalog. Tracks will be organized and ready for distribution."
    actionLabel={onAddTrack ? "Upload Track" : null}
    onAction={onAddTrack}
  />
);

export const EmptyAnalytics = ({ dataType = 'performance' }) => {
  const messages = {
    performance: {
      title: "No performance data yet",
      description: "Analytics will appear here once your content starts receiving plays and engagement."
    },
    earnings: {
      title: "No earnings data available",
      description: "Revenue and royalty information will be displayed here as your music generates income."
    },
    demographics: {
      title: "No audience data yet",
      description: "Listener demographics and geographic data will show once you have active streams."
    }
  };

  const message = messages[dataType] || messages.performance;

  return (
    <EmptyState
      icon={FaChartBar}
      title={message.title}
      description={message.description}
    />
  );
};

export const EmptyDashboard = ({ userRole = 'artist' }) => {
  const roleMessages = {
    artist: {
      title: "Welcome to your artist dashboard",
      description: "Your performance metrics, earnings, and release analytics will appear here as you build your catalog."
    },
    label_admin: {
      title: "Welcome to your label dashboard", 
      description: "Artist management, release oversight, and label analytics will be displayed here as your roster grows."
    },
    company_admin: {
      title: "Welcome to the admin dashboard",
      description: "Platform-wide metrics, user management, and system overview will populate as the platform is used."
    },
    super_admin: {
      title: "Welcome to the control center",
      description: "Complete platform analytics, user management, and system configuration tools are ready for use."
    }
  };

  const message = roleMessages[userRole] || roleMessages.artist;

  return (
    <EmptyState
      icon={FaChartBar}
      title={message.title}
      description={message.description}
      className="bg-gray-50 rounded-lg"
    />
  );
};

export const EmptyUsers = ({ onInviteUser = null, userRole = 'admin' }) => (
  <EmptyState
    icon={FaUsers}
    title="No users found"
    description="Invite team members, artists, or collaborators to join the platform and start building your network."
    actionLabel={onInviteUser && (userRole === 'admin' || userRole === 'super_admin') ? "Invite Users" : null}
    onAction={onInviteUser}
  />
);

// Loading state component
export const LoadingState = ({ message = "Loading..." }) => (
  <div className="text-center py-12 px-4">
    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
    <p className="text-gray-500">Please wait while we fetch your data</p>
  </div>
);

// Error state component
export const ErrorState = ({ message = "Something went wrong", onRetry = null }) => (
  <div className="text-center py-12 px-4">
    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-4">
      <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load data</h3>
    <p className="text-gray-500 mb-6">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Try Again
      </button>
    )}
  </div>
);