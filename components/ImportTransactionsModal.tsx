import React from 'react';
import { Transaction, TransactionType } from '../types';

interface ImportTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onConfirm: () => void;
}

const ImportTransactionsModal: React.FC<ImportTransactionsModalProps> = ({ isOpen, onClose, transactions, onConfirm }) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Confirmar Importação</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Encontramos <span className="font-bold">{transactions.length}</span> novo(s) lançamento(s) para importar.
          </p>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <ul className="space-y-2">
            {transactions.map(t => (
              <li key={t.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{t.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')} - {t.category} &gt; {t.subcategory}
                  </p>
                </div>
                <span className={`font-bold ${t.type === TransactionType.INCOME ? 'text-income' : 'text-expense'}`}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Confirmar Importação
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportTransactionsModal;
