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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmar Exclusão de Parcela</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Esta transação é a parcela <span className="font-bold">{current} de {total}</span>. Como você deseja proceder?
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 space-y-3">
             <button
                onClick={() => onConfirmDelete(transaction.id, 'all-future')}
                className="w-full text-left p-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
                <p className="font-semibold text-red-700 dark:text-red-400">Excluir esta e todas as parcelas futuras</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Use esta opção se você quitou ou cancelou a compra.</p>
            </button>
             <button
                onClick={() => onConfirmDelete(transaction.id, 'single')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <p className="font-semibold text-gray-800 dark:text-gray-200">Excluir somente esta parcela ({current}/{total})</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">As outras parcelas não serão afetadas.</p>
            </button>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInstallmentModal;