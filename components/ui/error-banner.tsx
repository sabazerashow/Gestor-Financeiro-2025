import React from 'react';

interface ErrorBannerProps {
  message: string | null;
  onClose?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-md border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 text-[var(--destructive)] p-3">
      <i className="fas fa-exclamation-circle mt-0.5"></i>
      <div className="flex-1 text-sm">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-[var(--destructive)]/80 hover:text-[var(--destructive)]"
          aria-label="Fechar aviso"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
