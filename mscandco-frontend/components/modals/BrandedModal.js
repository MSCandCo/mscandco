'use client'

import { X } from 'lucide-react';

export default function BrandedModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md' // sm, md, lg, xl
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
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
        <div className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full border-2 border-gray-300`} style={{
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
            
            <div className="flex items-center gap-4 relative z-10 flex-1">
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
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

