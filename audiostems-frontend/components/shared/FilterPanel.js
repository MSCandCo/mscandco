// 🎯 SHARED FILTER PANEL COMPONENT
// Eliminates duplicate filter code across all dashboards

import { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { Search, Filter, X } from 'lucide-react';
import { RELEASE_STATUSES, GENRES, RELEASE_TYPES, getStatusLabel } from '../../lib/constants';

export default function FilterPanel({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  genreFilter,
  onGenreChange,
  typeFilter,
  onTypeChange,
  dateFilter,
  onDateChange,
  customFilters = [],
  onClearFilters,
  showDateFilter = false,
  showGenreFilter = true,
  showTypeFilter = true,
  showStatusFilter = true,
  placeholder = "Search...",
  compact = false
}) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const hasActiveFilters = () => {
    return searchTerm || 
           (statusFilter && statusFilter !== 'all') ||
           (genreFilter && genreFilter !== 'all') ||
           (typeFilter && typeFilter !== 'all') ||
           (dateFilter && dateFilter !== 'all') ||
           customFilters.some(f => f.value && f.value !== 'all');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter && statusFilter !== 'all') count++;
    if (genreFilter && genreFilter !== 'all') count++;
    if (typeFilter && typeFilter !== 'all') count++;
    if (dateFilter && dateFilter !== 'all') count++;
    count += customFilters.filter(f => f.value && f.value !== 'all').length;
    return count;
  };

  const clearAllFilters = () => {
    onSearchChange && onSearchChange('');
    onStatusChange && onStatusChange('all');
    onGenreChange && onGenreChange('all');
    onTypeChange && onTypeChange('all');
    onDateChange && onDateChange('all');
    customFilters.forEach(filter => {
      filter.onChange && filter.onChange('all');
    });
    onClearFilters && onClearFilters();
  };

  if (compact && !isExpanded) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm || ''}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters() && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      {compact && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className={compact ? "md:col-span-2" : "lg:col-span-2"}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm || ''}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter || 'all'}
              onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              {Object.entries(RELEASE_STATUSES).map(([key, value]) => (
                <option key={value} value={value}>{getStatusLabel(value)}</option>
              ))}
            </select>
          </div>
        )}

        {/* Genre Filter */}
        {showGenreFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
            <select
              value={genreFilter || 'all'}
              onChange={(e) => onGenreChange && onGenreChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Genres</option>
              {GENRES.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Type Filter */}
        {showTypeFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter || 'all'}
              onChange={(e) => onTypeChange && onTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {RELEASE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date Filter */}
        {showDateFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={dateFilter || 'all'}
              onChange={(e) => onDateChange && onDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        )}

        {/* Custom Filters */}
        {customFilters.map((filter, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{filter.label}</label>
            <select
              value={filter.value || 'all'}
              onChange={(e) => filter.onChange && filter.onChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All {filter.label}</option>
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={clearAllFilters}
            disabled={!hasActiveFilters()}
            className={`px-4 py-2 rounded-lg font-medium ${
              hasActiveFilters()
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Search: "{searchTerm}"
                </span>
              )}
              {statusFilter && statusFilter !== 'all' && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Status: {getStatusLabel(statusFilter)}
                </span>
              )}
              {genreFilter && genreFilter !== 'all' && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  Genre: {genreFilter}
                </span>
              )}
              {typeFilter && typeFilter !== 'all' && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Type: {typeFilter}
                </span>
              )}
              {customFilters
                .filter(f => f.value && f.value !== 'all')
                .map((filter, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    {filter.label}: {filter.options.find(o => o.value === filter.value)?.label || filter.value}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}