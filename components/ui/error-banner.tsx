import React from 'react';

interface ErrorBannerProps {
  message: string | null;
  onClose?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-md border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 p-3">
      <i className="fas fa-exclamation-circle mt-0.5"></i>
      <div className="flex-1 text-sm">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200"
          aria-label="Fechar aviso"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
