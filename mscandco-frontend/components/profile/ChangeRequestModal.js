'use client'

import { useState } from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { NationalityDropdown, CountryDropdown, CityDropdown } from '../shared/IntelligentDropdowns';
import { formatDateOfBirth } from '../../lib/date-utils';

export default function ChangeRequestModal({ isOpen, onClose, currentProfile, onSubmit }) {
  const [requestData, setRequestData] = useState({
    firstName: currentProfile?.firstName || '',
    lastName: currentProfile?.lastName || '',
    dateOfBirth: currentProfile?.dateOfBirth || '',
    nationality: currentProfile?.nationality || '',
    country: currentProfile?.country || '',
    city: currentProfile?.city || '',
    reason: '',
    supportingDocuments: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setRequestData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check if any changes were made
    const hasChanges = 
      requestData.firstName !== currentProfile?.firstName ||
      requestData.lastName !== currentProfile?.lastName ||
      requestData.dateOfBirth !== currentProfile?.dateOfBirth ||
      requestData.nationality !== currentProfile?.nationality ||
      requestData.country !== currentProfile?.country ||
      requestData.city !== currentProfile?.city;
    
    if (!hasChanges) {
      newErrors.general = 'Please make at least one change to submit a request';
    }
    
    if (!requestData.reason?.trim()) {
      newErrors.reason = 'Please provide a reason for the changes';
    }
    
    if (requestData.reason?.trim().length < 10) {
      newErrors.reason = 'Please provide a more detailed reason (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare change request data
      const changeRequest = {
        requestType: 'profile_change',
        currentData: {
          firstName: currentProfile?.firstName,
          lastName: currentProfile?.lastName,
          dateOfBirth: currentProfile?.dateOfBirth,
          nationality: currentProfile?.nationality,
          country: currentProfile?.country,
          city: currentProfile?.city
        },
        requestedData: {
          firstName: requestData.firstName,
          lastName: requestData.lastName,
          dateOfBirth: requestData.dateOfBirth,
          nationality: requestData.nationality,
          country: requestData.country,
          city: requestData.city
        },
        reason: requestData.reason,
        supportingDocuments: requestData.supportingDocuments,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      await onSubmit(changeRequest);
      onClose();
      
    } catch (error) {
      console.error('Error submitting change request:', error);
      setErrors({ submit: 'Error submitting request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Request Profile Changes</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Warning Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Profile Change Request
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    Changes to locked profile information require approval from a Company Admin or Super Admin. 
                    Please provide a valid reason for the requested changes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={requestData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new first name"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {currentProfile?.firstName || 'Not set'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={requestData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new last name"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {currentProfile?.lastName || 'Not set'}
              </p>
            </div>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <NationalityDropdown
                value={requestData.nationality}
                onChange={(value) => handleInputChange('nationality', value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {currentProfile?.nationality || 'Not set'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <CountryDropdown
                value={requestData.country}
                onChange={(value) => handleInputChange('country', value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {currentProfile?.country || 'Not set'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <CityDropdown
                value={requestData.city}
                onChange={(value) => handleInputChange('city', value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {currentProfile?.city || 'Not set'}
              </p>
            </div>
          </div>

          {/* Reason for Change */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Changes *
            </label>
            <textarea
              value={requestData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Please explain why you need to change this information (e.g., legal name change, relocation, etc.)"
              required
            />
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Supporting Documents */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Documents (Optional)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => handleInputChange('supportingDocuments', Array.from(e.target.files))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload documents that support your change request (passport, driver's license, utility bills, etc.)
            </p>
          </div>

          {/* Error Messages */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Change Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
