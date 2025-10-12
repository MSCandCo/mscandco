import React from 'react';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

const NotificationModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info', // 'success', 'warning', 'error', 'info'
  buttonText = 'OK',
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  React.useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Info className="w-8 h-8 text-blue-500" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getBorderClass = () => {
    switch (type) {
      case 'success':
        return 'border-t-4 border-green-500';
      case 'warning':
        return 'border-t-4 border-amber-500';
      case 'error':
        return 'border-t-4 border-red-500';
      default:
        return 'border-t-4 border-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className={`inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${getBorderClass()}`}>
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                {getIcon()}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
                <div className="text-sm text-gray-600">
                  {typeof message === 'string' ? (
                    <p className="whitespace-pre-line">{message}</p>
                  ) : (
                    message
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:justify-end">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 text-base font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm ${getButtonClass()}`}
              onClick={onClose}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;