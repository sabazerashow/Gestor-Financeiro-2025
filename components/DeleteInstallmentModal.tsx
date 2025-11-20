import React from 'react';
import { Transaction } from '../types';

interface DeleteInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onConfirmDelete: (id: string, scope: 'single' | 'all-future') => void;
}

const DeleteInstallmentModal: React.FC<DeleteInstallmentModalProps> = ({ isOpen, onClose, transaction, onConfirmDelete }) => {
  if (!isOpen || !transaction.installmentDetails) return null;

  const { current, total } = transaction.installmentDetails;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-[var(--card)] rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold text-[var(--color-text)]">Confirmar Exclusão de Parcela</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Esta transação é a parcela <span className="font-bold">{current} de {total}</span>. Como você deseja proceder?
          </p>
        </div>
        
        <div className="p-4 bg-[var(--surface)] space-y-3">
             <button
                onClick={() => onConfirmDelete(transaction.id, 'all-future')}
                className="w-full text-left p-3 rounded-lg hover:bg-[var(--destructive)/10] transition-colors"
            >
                <p className="font-semibold text-[var(--destructive)]">Excluir esta e todas as parcelas futuras</p>
                <p className="text-xs text-[var(--color-text-muted)]">Use esta opção se você quitou ou cancelou a compra.</p>
            </button>
             <button
                onClick={() => onConfirmDelete(transaction.id, 'single')}
                className="w-full text-left p-3 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
            >
                <p className="font-semibold text-[var(--color-text)]">Excluir somente esta parcela ({current}/{total})</p>
                <p className="text-xs text-[var(--color-text-muted)]">As outras parcelas não serão afetadas.</p>
            </button>
        </div>

        <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--color-text)] bg-[var(--card)] hover:bg-[var(--color-surface-hover)] border border-[var(--border)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInstallmentModal;