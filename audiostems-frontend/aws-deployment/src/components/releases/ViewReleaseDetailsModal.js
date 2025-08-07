import { FaTimes, FaMusic, FaCalendar, FaUser, FaTag, FaFileAlt } from 'react-icons/fa';
import { formatCurrency } from '../shared/CurrencySelector';

export default function ViewReleaseDetailsModal({ isOpen, onClose, release, currency = 'GBP' }) {
  if (!isOpen || !release) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'live': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'under_review': return 'In Review';
      case 'approval_required': return 'Approvals';
      case 'completed': return 'Completed';
      case 'live': return 'Live';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{release.cover}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{release.projectName}</h2>
              <p className="text-gray-600">{release.artist}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FaTag className="text-gray-400" />
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(release.status)}`}>
                  {getStatusLabel(release.status)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FaMusic className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Release Type</p>
                    <p className="font-medium">{release.releaseType}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaTag className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Genre</p>
                    <p className="font-medium">{release.genre}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaUser className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Artist</p>
                    <p className="font-medium">{release.artist}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FaCalendar className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Submission Date</p>
                    <p className="font-medium">{new Date(release.submissionDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaCalendar className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Expected Release Date</p>
                    <p className="font-medium">{new Date(release.expectedReleaseDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FaCalendar className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{new Date(release.lastUpdated).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Assets</p>
              <p className="text-2xl font-bold text-gray-900">{release.assets}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(release.earnings || 0, currency)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Streams</p>
              <p className="text-2xl font-bold text-gray-900">{release.streams?.toLocaleString() || '0'}</p>
            </div>
          </div>

          {/* Track Listing */}
          {release.trackListing && release.trackListing.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaMusic className="mr-2" />
                Track Listing ({release.trackListing.length} tracks)
              </h3>
              <div className="space-y-3">
                {release.trackListing.map((track, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{track.title}</p>
                          <p className="text-sm text-gray-600">Duration: {track.duration}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">ISRC</p>
                        <p className="text-sm font-mono text-gray-700">{track.isrc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credits */}
          {release.credits && release.credits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaUser className="mr-2" />
                Credits
              </h3>
              <div className="space-y-3">
                {release.credits.map((credit, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{credit.role || credit.name}</p>
                        <p className="text-sm text-gray-600">{credit.fullName || credit.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publishing Notes */}
          {release.publishingNotes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaFileAlt className="mr-2" />
                Publishing Notes
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{release.publishingNotes}</p>
              </div>
            </div>
          )}

          {/* Marketing Plan */}
          {release.marketingPlan && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaFileAlt className="mr-2" />
                Marketing Plan
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{release.marketingPlan}</p>
              </div>
            </div>
          )}

          {/* Feedback */}
          {release.feedback && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaFileAlt className="mr-2" />
                Feedback
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{release.feedback}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 