import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Confirmar exclusão',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-[var(--card)] rounded-xl shadow-2xl w-11/12 max-w-md p-6">
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-3">{title}</h2>
        <p className="text-[var(--color-text-muted)] mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive-hover)] transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

