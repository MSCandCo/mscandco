'use client'

import { FaTimes, FaMusic, FaCalendar, FaUser, FaTag, FaFileAlt, FaGlobe, FaBarcode } from 'react-icons/fa';
import { formatCurrency } from '../shared/CurrencySelector';

export default function ViewReleaseDetailsModal({ isOpen, onClose, release, currency = 'GBP' }) {
  if (!isOpen || !release) return null;

  // Parse saved form data from publishing_info if available
  let savedFormData = {};
  if (release.publishing_info) {
    try {
      savedFormData = JSON.parse(release.publishing_info);
    } catch (e) {
      console.warn('Could not parse publishing_info:', e);
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_review': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'live': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    switch (status.toLowerCase()) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'in_review': return 'In Review';
      case 'approved': return 'Approved';
      case 'completed': return 'Completed';
      case 'live': return 'Live';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header - Match main form styling */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Release Details - {release.title || savedFormData.releaseTitle || 'Untitled'}
          </h2>
          
          {/* Close X button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Match main form sections */}
        <div className="p-6 space-y-8">
          {/* Project Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Release Title</p>
                  <p className="text-gray-900">{release.title || savedFormData.releaseTitle || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Primary Artist</p>
                  <p className="text-gray-900">{release.artist_name || savedFormData.primaryArtist || 'Not specified'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(release.status)}`}>
                    {getStatusLabel(release.status)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Release Type</p>
                  <p className="text-gray-900">{release.release_type || savedFormData.releaseType || 'Single'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Primary Genre</p>
                  <p className="text-gray-900">{release.genre || savedFormData.genre || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Secondary Genre</p>
                  <p className="text-gray-900">{release.subgenre || savedFormData.secondaryGenre || 'None'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Release Date</p>
                  <p className="text-gray-900">
                    {release.release_date ? new Date(release.release_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-gray-900">
                    {release.created_at ? new Date(release.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-gray-900">
                    {release.updated_at ? new Date(release.updated_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Information */}
          {savedFormData.assets && savedFormData.assets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h3>
              {savedFormData.assets.map((asset, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Song Title</p>
                      <p className="text-gray-900">{asset.songTitle || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Duration</p>
                      <p className="text-gray-900">{asset.duration || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Explicit</p>
                      <p className="text-gray-900">{asset.explicit ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  
                  {asset.contributors && asset.contributors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Contributors</p>
                      <div className="space-y-1">
                        {asset.contributors.map((contributor, i) => (
                          <p key={i} className="text-sm text-gray-900">
                            {contributor.name} - {contributor.type}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Technical Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">UPC</p>
                  <p className="text-gray-900 font-mono">{release.upc || savedFormData.upc || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">ISRC</p>
                  <p className="text-gray-900 font-mono">{release.isrc || savedFormData.assets?.[0]?.isrc || 'Not assigned'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Catalog Number</p>
                  <p className="text-gray-900">{release.catalog_number || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Copyright</p>
                  <p className="text-gray-900">{release.copyright_holder || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {savedFormData.label && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Label</p>
                    <p className="text-gray-900">{savedFormData.label}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600">Territory</p>
                  <p className="text-gray-900">
                    {savedFormData.sellWorldwide !== false ? 'Worldwide' : 'Restricted'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer - Match main form styling */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 