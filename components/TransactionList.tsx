

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
    className={`px-3 py-1 text-sm rounded-full transition-colors ${
      isActive
        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold'
        : 'bg-[var(--surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]/60 hover:text-[var(--color-text)]'
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

  const groupedTransactions = React.useMemo(() => {
    if (monthFilter !== 'all') {
      return null; // Don't group if a specific month is selected
    }

    // FIX: Use a generic argument for `reduce` to ensure the accumulator is correctly typed.
    return transactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
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
    <div className="bg-[var(--card)] p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Lançamentos</h2>
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 w-full">
             {onMonthFilterChange && (
                 <select
                    value={monthFilter}
                    onChange={(e) => onMonthFilterChange(e.target.value)}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-full shadow-sm py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                    <option value="all">Todos os Meses</option>
                    {availableMonths.map(month => {
                        const [year, m] = month.split('-');
                        const monthName = new Date(Number(year), Number(m) - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                        return <option key={month} value={month}>{monthName}</option>
                    })}
                </select>
             )}
             {onPaymentMethodFilterChange && (
                 <select
                    value={paymentMethodFilter}
                    onChange={(e) => onPaymentMethodFilterChange(e.target.value as 'all' | PaymentMethod)}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-full shadow-sm py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                    <option value="all">Todos os Métodos</option>
                    {Object.values(PaymentMethod).map(method => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
             )}
            <div className="flex items-center space-x-2 border-l border-[var(--border)] pl-2">
                <FilterButton label="Todas" isActive={installmentFilter === 'all'} onClick={() => onInstallmentFilterChange?.('all')} />
                <FilterButton label="À Vista" isActive={installmentFilter === 'single'} onClick={() => onInstallmentFilterChange?.('single')} />
                <FilterButton label="Parceladas" isActive={installmentFilter === 'installments'} onClick={() => onInstallmentFilterChange?.('installments')} />
            </div>
            {onAnalyzePending && (
              <div className="ml-auto">
                <Button
                  onClick={onAnalyzePending}
                  disabled={isAnalyzingPending}
                  size="sm"
                  title="Analisar registros com categoria 'A verificar'"
                >
                  {isAnalyzingPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span className="ml-2">Analisando...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-wand-magic-sparkles"></i>
                      <span className="ml-2">Analisar registros</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      {transactions.length === 0 ? (
        <p className="text-[var(--color-text-muted)] text-center py-8">Nenhum lançamento registrado para este filtro.</p>
      ) : groupedTransactions ? (
        <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([monthYear, monthTransactions]) => (
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
