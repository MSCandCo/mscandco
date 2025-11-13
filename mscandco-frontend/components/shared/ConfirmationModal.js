'use client'

import React from 'react';
import { AlertTriangle, CheckCircle, X, Info } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'success', 'info'
  confirmButtonClass = '',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'info':
        return <Info className="w-8 h-8 text-blue-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-amber-500" />;
    }
  };

  const getConfirmButtonClass = () => {
    if (confirmButtonClass) return confirmButtonClass;
    
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'info':
        return 'bg-msc-blue-600 hover:bg-msc-blue-700 focus:ring-msc-blue-500';
      default:
        return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border-2 border-gray-300" style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Branded Header */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-5 flex items-center justify-between relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}></div>
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              {/* MSC & Co Logo */}
              <div className="flex-shrink-0 relative">
                <img
                  src="/logos/MSCandCoLogoV2.svg"
                  alt="MSC & Co"
                  className="h-10 w-10 object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {/* Fallback icon if logo fails */}
                <div className="absolute inset-0 flex items-center justify-center h-10 w-10 rounded-full bg-white/20" style={{ display: 'none' }}>
                  {getIcon()}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl leading-6 font-bold text-white mb-1">
                  {title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-white/60"></div>
                  <p className="text-xs font-medium text-gray-300">MSC & Co Platform</p>
                  <div className="h-1 w-1 rounded-full bg-white/60"></div>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 relative z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6">
            <div className="text-sm text-gray-700">
              {typeof message === 'string' ? (
                <p className="leading-relaxed">{message}</p>
              ) : (
                <div className="leading-relaxed">{message}</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3 border-t border-gray-200">
            <button
              type="button"
              className={`w-full inline-flex items-center justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 text-base font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-0 sm:w-auto sm:text-sm hover:shadow-md ${getConfirmButtonClass()} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex items-center justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all sm:mt-0 sm:w-auto sm:text-sm hover:shadow-md"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;