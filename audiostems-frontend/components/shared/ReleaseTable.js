// 🎯 SHARED RELEASE TABLE COMPONENT
// Eliminates duplicate table code across all dashboards

import { useState } from 'react';
import { FaEye, FaEdit, FaDownload, FaPlay, FaCheck, FaTimes } from 'react-icons/fa';
import { Eye, Edit, Download, Play, Check, X } from 'lucide-react';
import { getStatusLabel, getStatusColor, getStatusIcon } from '../../lib/constants';
import { formatCurrency } from './CurrencySelector';

export default function ReleaseTable({ 
  releases, 
  onViewRelease, 
  onEditRelease, 
  onDownloadRelease, 
  showActions = true,
  showIsrcEdit = false,
  onIsrcEdit,
  editingIsrc,
  tempIsrc,
  onStartEditingIsrc,
  onSaveIsrc,
  onCancelEditingIsrc,
  compact = false,
  roleFilter = null, // 'artist', 'distribution_partner', 'admin', etc.
  currency = 'GBP' // Currency for formatting earnings
}) {


  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getActionsForRole = (release) => {
    const actions = [];
    
    if (onViewRelease) {
      actions.push({
        icon: <Eye className="w-3 h-3" />,
        label: 'View',
        onClick: () => onViewRelease(release),
        className: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      });
    }
    
    if (onEditRelease && (!roleFilter || roleFilter === 'artist' || roleFilter === 'distribution_partner')) {
      actions.push({
        icon: <Edit className="w-3 h-3" />,
        label: 'Edit',
        onClick: () => onEditRelease(release),
        className: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      });
    }
    
    if (onDownloadRelease) {
      actions.push({
        icon: <Download className="w-3 h-3" />,
        label: 'Export',
        onClick: () => onDownloadRelease(release),
        className: 'bg-green-100 text-green-700 hover:bg-green-200'
      });
    }
    
    return actions;
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {releases.map((release) => (
          <div key={release.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{release.projectName}</h3>
                <p className="text-sm text-gray-600">{release.artist} • {release.releaseType}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                {getStatusIcon(release.status)}
                <span className="ml-1">{getStatusLabel(release.status)}</span>
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-gray-500">Streams:</span>
                <span className="ml-2 font-medium">{formatNumber(release.streams || 0)}</span>
              </div>
              <div>
                <span className="text-gray-500">Earnings:</span>
                <span className="ml-2 font-medium">{formatCurrency(release.earnings || 0, currency)}</span>
              </div>
            </div>
            
            {showActions && (
              <div className="flex space-x-2">
                {getActionsForRole(release).map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.onClick}
                    className={`px-3 py-1 text-xs rounded flex items-center space-x-1 ${action.className}`}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Release
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Artist
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Streams
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Earnings
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                Release Date
              </th>
              {showActions && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {releases.map((release) => (
              <tr key={release.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{release.projectName}</div>
                    <div className="text-xs text-gray-500">{release.genre}</div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 w-32">
                  {release.artist}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 w-24">
                  {release.releaseType}
                </td>
                <td className="px-4 py-4 w-32">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                    {getStatusIcon(release.status)}
                    <span className="ml-1">{getStatusLabel(release.status)}</span>
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 w-24">
                  {formatNumber(release.streams || 0)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 w-24">
                  {formatCurrency(release.earnings || 0, currency)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 w-28">
                  {release.expectedReleaseDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </td>
                {showActions && (
                  <td className="px-4 py-4 text-right w-32">
                    <div className="flex justify-end space-x-2">
                      {getActionsForRole(release).map((action, idx) => (
                        <button
                          key={idx}
                          onClick={action.onClick}
                          className={`px-2 py-1 text-xs rounded flex items-center space-x-1 ${action.className}`}
                          title={action.label}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Track Listing Tables (if expanded view) */}
      {releases.some(r => r.showTracks) && (
        <div className="border-t bg-gray-50 p-4">
          {releases
            .filter(r => r.showTracks)
            .map(release => (
              <div key={`tracks-${release.id}`} className="mb-6 last:mb-0">
                <h4 className="font-medium text-gray-900 mb-3">
                  Tracks in "{release.projectName}"
                </h4>
                <div className="bg-white rounded border overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-80">Track Title</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-20">Duration</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-16">BPM</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-24">Key</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-32">ISRC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(release.trackListing || []).map((track, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2 w-80">
                            <input
                              type="text"
                              value={track.title || ''}
                              className="w-full border-none bg-transparent text-sm"
                              readOnly
                            />
                          </td>
                          <td className="px-3 py-2 w-20">
                            <input
                              type="text"
                              value={track.duration || ''}
                              className="w-full border-none bg-transparent text-sm"
                              readOnly
                            />
                          </td>
                          <td className="px-3 py-2 w-16">
                            <input
                              type="text"
                              value={track.bpm || ''}
                              className="w-full border-none bg-transparent text-sm"
                              readOnly
                            />
                          </td>
                          <td className="px-3 py-2 w-24">
                            <input
                              type="text"
                              value={track.songKey || track.key || ''}
                              className="w-full border-none bg-transparent text-sm"
                              readOnly
                            />
                          </td>
                          <td className="px-3 py-2 w-32">
                            {showIsrcEdit && editingIsrc === `${release.id}-${idx}` ? (
                              <div className="flex items-center space-x-1">
                                <input
                                  type="text"
                                  value={tempIsrc}
                                  onChange={(e) => onIsrcEdit && onIsrcEdit(e.target.value)}
                                  className="flex-1 text-xs border border-blue-300 rounded px-1 py-1"
                                  autoFocus
                                />
                                <button
                                  onClick={() => onSaveIsrc && onSaveIsrc(release.id, idx)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onCancelEditingIsrc && onCancelEditingIsrc()}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="text-sm">{track.isrc || ''}</span>
                                {showIsrcEdit && onStartEditingIsrc && (
                                  <button
                                    onClick={() => onStartEditingIsrc(release.id, idx, track.isrc)}
                                    className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}