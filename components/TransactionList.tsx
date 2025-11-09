

import React from 'react';
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
        ? 'bg-indigo-600 text-white font-semibold'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Lançamentos</h2>
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 w-full">
             {onMonthFilterChange && (
                 <select
                    value={monthFilter}
                    onChange={(e) => onMonthFilterChange(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="all">Todos os Métodos</option>
                    {Object.values(PaymentMethod).map(method => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
             )}
            <div className="flex items-center space-x-2 border-l border-gray-300 dark:border-gray-600 pl-2">
                <FilterButton label="Todas" isActive={installmentFilter === 'all'} onClick={() => onInstallmentFilterChange?.('all')} />
                <FilterButton label="À Vista" isActive={installmentFilter === 'single'} onClick={() => onInstallmentFilterChange?.('single')} />
                <FilterButton label="Parceladas" isActive={installmentFilter === 'installments'} onClick={() => onInstallmentFilterChange?.('installments')} />
            </div>
            {onAnalyzePending && (
              <div className="ml-auto">
                <button
                  onClick={onAnalyzePending}
                  disabled={isAnalyzingPending}
                  className={`px-3 py-1 text-sm font-medium rounded-md text-white transition-colors flex items-center gap-2 ${isAnalyzingPending ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  title="Analisar registros com categoria 'A verificar'"
                >
                  {isAnalyzingPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Analisando...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-wand-magic-sparkles"></i>
                      <span>Analisar registros</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum lançamento registrado para este filtro.</p>
      ) : groupedTransactions ? (
        <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([monthYear, monthTransactions]) => (
                <div key={monthYear}>
                    <h3 className="text-md font-semibold text-gray-600 dark:text-gray-400 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700 capitalize">{monthYear}</h3>
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
