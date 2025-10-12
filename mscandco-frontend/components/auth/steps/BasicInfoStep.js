import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { NationalityDropdown, CountryDropdown, CityDropdown } from '../../shared/IntelligentDropdowns';

export default function BasicInfoStep({ formData, setFormData, onNext, onBack, isLoading }) {
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      newErrors.dateOfBirth = 'Complete date of birth is required';
    }
    
    if (!formData.nationality) {
      newErrors.nationality = 'Nationality is required';
    }
    
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onNext();
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 110 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600">
          This information will be locked after registration and can only be changed with admin approval.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your first name"
              required
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your last name"
              required
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <select
                value={formData.birthDay}
                onChange={(e) => handleInputChange('birthDay', e.target.value)}
                className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300 ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Day</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={formData.birthMonth}
                onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300 ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Month</option>
                {months.map((month, index) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={formData.birthYear}
                onChange={(e) => handleInputChange('birthYear', e.target.value)}
                className={`w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300 ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          {errors.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Format: 6 November 1989
          </p>
        </div>

        {/* Location Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationality *
            </label>
            <NationalityDropdown
              value={formData.nationality}
              onChange={(value) => handleInputChange('nationality', value)}
              className={errors.nationality ? 'border-red-500' : ''}
            />
            {errors.nationality && (
              <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <CountryDropdown
              value={formData.country}
              onChange={(value) => handleInputChange('country', value)}
              className={errors.country ? 'border-red-500' : ''}
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <CityDropdown
              value={formData.city}
              onChange={(value) => handleInputChange('city', value)}
              className={errors.city ? 'border-red-500' : ''}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Important: This information will be locked
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  Once you complete registration, this basic information cannot be changed directly. 
                  Any future changes will require approval from a company administrator.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-6 py-3 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Completing Registration...
              </>
            ) : (
              <>
                Complete Registration
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
