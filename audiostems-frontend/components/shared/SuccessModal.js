import React from 'react';

const SuccessModal = ({ isOpen, onClose, title, message, buttonText = "Close" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-80 h-80 flex flex-col items-center justify-center text-center p-6">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        {title && (
          <h2 className="text-xl font-semibold text-gray-900 mb-3 font-sans">
            {title}
          </h2>
        )}

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6 font-sans leading-relaxed">
          {message}
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sans font-medium"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;