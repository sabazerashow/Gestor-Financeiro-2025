

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
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredBySearch = React.useMemo(() => {
    if (!searchTerm) return transactions;
    const lower = searchTerm.toLowerCase();
    return transactions.filter(t =>
      t.description.toLowerCase().includes(lower) ||
      t.category?.toLowerCase().includes(lower) ||
      t.amount.toString().includes(lower)
    );
  }, [transactions, searchTerm]);

  const groupedTransactions = React.useMemo<Record<string, Transaction[]> | null>(() => {
    if (monthFilter !== 'all') {
      return null;
    }

    return filteredBySearch.reduce((acc: Record<string, Transaction[]>, transaction) => {
      const date = new Date(transaction.date + 'T00:00:00');
      const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(transaction);
      return acc;
    }, {});
  }, [filteredBySearch, monthFilter]);


  const renderTransactionList = (list: Transaction[]) => (
    <ul className="space-y-3">
      {list.map(transaction => (
        <TransactionItem key={transaction.id} transaction={transaction} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );

  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm animate-in fade-in duration-700 min-h-[680px]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
            <i className="fas fa-list-ul"></i>
          </div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Histórico de Gastos</h2>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs group-focus-within:text-[var(--primary)] transition-colors"></i>
              <input
                type="text"
                placeholder="Pesquisar lançamentos..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 pl-10 pr-4 py-2 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-widest border-none shadow-sm focus:ring-2 focus:ring-[var(--primary)]/10 w-full md:w-64 outline-none transition-all hover:bg-gray-100"
              />
            </div>

            {onMonthFilterChange && (
              <select
                value={monthFilter}
                onChange={(e) => onMonthFilterChange(e.target.value)}
                className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 cursor-pointer hover:bg-gray-100 transition-all"
              >
                <option value="all">Ver Tudo</option>
                {availableMonths.map(month => {
                  const [year, m] = month.split('-');
                  const monthName = new Date(Number(year), Number(m) - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                  return <option key={month} value={month}>{monthName}</option>
                })}
              </select>
            )}

            {onAnalyzePending && (
              <button
                onClick={onAnalyzePending}
                disabled={isAnalyzingPending}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-[var(--primary)] hover:bg-gray-100 transition-all"
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

      <div className="w-full text-left border-collapse overflow-y-auto pr-2 custom-scrollbar" style={{ height: '500px' }}>
        <div className="space-y-2">
          {filteredBySearch.length === 0 ? (
            <p className="text-gray-300 text-center py-10 italic">Nenhum lançamento encontrado.</p>
          ) : monthFilter === 'all' && groupedTransactions ? (
            Object.entries(groupedTransactions).map(([month, list]) => (
              <div key={month} className="mb-8">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-4 border-l-2 border-[var(--primary)]">{month}</h3>
                {renderTransactionList(list as Transaction[])}
              </div>
            ))
          ) : (
            renderTransactionList(filteredBySearch)
          )}
        </div>
      </div>

    </div>
  );
};

export default TransactionList;
