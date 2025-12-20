

import React from 'react';
import { Button } from './ui/button';
import { Transaction, PaymentMethod } from '../types';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onAnalyzePending?: () => void;
  isAnalyzingPending?: boolean;
  installmentFilter?: 'all' | 'single' | 'installments';
  onInstallmentFilterChange?: (filter: 'all' | 'single' | 'installments') => void;
  monthFilter?: 'all' | string;
  onMonthFilterChange?: (filter: 'all' | string) => void;
  paymentMethodFilter?: 'all' | PaymentMethod;
  onPaymentMethodFilterChange?: (filter: 'all' | PaymentMethod) => void;
  availableMonths?: string[];
  showFilters?: boolean;
}

const FilterButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${isActive
      ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20'
      : 'bg-[var(--muted)] text-[var(--color-text-muted)] hover:bg-[var(--border)]'
      }`}
  >
    {label}
  </button>
);

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  onEdit,
  installmentFilter = 'all',
  onInstallmentFilterChange,
  monthFilter = 'all',
  onMonthFilterChange,
  paymentMethodFilter = 'all',
  onPaymentMethodFilterChange,
  availableMonths = [],
  showFilters = true,
  onAnalyzePending,
  isAnalyzingPending
}) => {

  const groupedTransactions = React.useMemo<Record<string, Transaction[]> | null>(() => {
    if (monthFilter !== 'all') {
      return null;
    }

    return transactions.reduce((acc: Record<string, Transaction[]>, transaction) => {
      const date = new Date(transaction.date + 'T00:00:00');
      const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(transaction);
      return acc;
    }, {});
  }, [transactions, monthFilter]);


  const renderTransactionList = (list: Transaction[]) => (
    <ul className="space-y-3">
      {list.map(transaction => (
        <TransactionItem key={transaction.id} transaction={transaction} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );

  return (
    <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Histórico Financeiro</h2>
        {showFilters && (
          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-1 bg-gray-50 p-1.5 rounded-2xl">
              <button
                onClick={() => onMonthFilterChange?.('all')}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${monthFilter === 'all' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Todos
              </button>
              <button className="px-5 py-2 text-xs font-bold rounded-xl text-gray-400 hover:text-gray-600">Entradas</button>
              <button className="px-5 py-2 text-xs font-bold rounded-xl text-gray-400 hover:text-gray-600">Saídas</button>
            </div>

            {onAnalyzePending && (
              <button
                onClick={onAnalyzePending}
                disabled={isAnalyzingPending}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-400 hover:text-[var(--primary)] transition-all"
                title="Analisar com IA"
              >
                {isAnalyzingPending ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-wand-magic-sparkles"></i>
                )}
              </button>
            )}
          </div>
        )}
      </div>
      {transactions.length === 0 ? (
        <p className="text-[var(--color-text-muted)] text-center py-8">Nenhum lançamento registrado para este filtro.</p>
      ) : groupedTransactions ? (
        <div className="space-y-6">
          {(Object.entries(groupedTransactions) as [string, Transaction[]][]).map(([monthYear, monthTransactions]) => (
            <div key={monthYear}>
              <h3 className="text-md font-semibold text-[var(--color-text-muted)] mb-2 pb-1 border-b border-[var(--border)] capitalize">{monthYear}</h3>
              {renderTransactionList(monthTransactions)}
            </div>
          ))}
        </div>
      ) : (
        renderTransactionList(transactions)
      )}
    </div>
  );
};

export default TransactionList;
