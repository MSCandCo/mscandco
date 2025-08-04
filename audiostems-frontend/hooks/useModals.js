import { useState } from 'react';

export const useModals = () => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning',
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    buttonText: 'OK'
  });

  // Show confirmation dialog
  const showConfirmation = ({
    title,
    message,
    onConfirm,
    type = 'warning',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  }) => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        onConfirm: () => {
          onConfirm && onConfirm();
          resolve(true);
          closeConfirmModal();
        }
      });
    });
  };

  // Show notification dialog
  const showNotification = ({
    title,
    message,
    type = 'info',
    buttonText = 'OK',
    autoClose = false,
    autoCloseDelay = 3000
  }) => {
    setNotificationModal({
      isOpen: true,
      title,
      message,
      type,
      buttonText,
      autoClose,
      autoCloseDelay
    });
  };

  // Close modals
  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const closeNotificationModal = () => {
    setNotificationModal(prev => ({ ...prev, isOpen: false }));
  };

  // Convenience methods
  const confirmDelete = (itemName = 'this item', onConfirm) => {
    return showConfirmation({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      onConfirm,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  };

  const showSuccess = (message, title = 'Success') => {
    showNotification({
      title,
      message,
      type: 'success',
      autoClose: true,
      autoCloseDelay: 3000
    });
  };

  const showError = (message, title = 'Error') => {
    showNotification({
      title,
      message,
      type: 'error'
    });
  };

  const showWarning = (message, title = 'Warning') => {
    showNotification({
      title,
      message,
      type: 'warning'
    });
  };

  const showInfo = (message, title = 'Information') => {
    showNotification({
      title,
      message,
      type: 'info'
    });
  };

  return {
    // Modal states
    confirmModal,
    notificationModal,
    
    // Generic methods
    showConfirmation,
    showNotification,
    closeConfirmModal,
    closeNotificationModal,
    
    // Convenience methods
    confirmDelete,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useModals;