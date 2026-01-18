

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  showSorting?: boolean;
  onAnalyze?: (scope: 'all' | 'pending') => void;
  isAnalyzing?: boolean;
  aiProgress?: { current: number; total: number } | null;
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
  showSorting = true,
  onAnalyze,
  isAnalyzing,
  aiProgress
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<'date' | 'description' | 'amount' | 'type' | 'paymentMethod'>('date');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const [selectedAnalyzeScope, setSelectedAnalyzeScope] = React.useState<'all' | 'pending'>('pending');

  const filteredBySearch = React.useMemo(() => {
    if (!searchTerm) return transactions;
    const lower = searchTerm.toLowerCase();
    return transactions.filter(t =>
      t.description.toLowerCase().includes(lower) ||
      t.category?.toLowerCase().includes(lower) ||
      t.amount.toString().includes(lower)
    );
  }, [transactions, searchTerm]);

  const sortedTransactions = React.useMemo(() => {
    const list = [...filteredBySearch];
    const dir = sortDirection === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      switch (sortField) {
        case 'description': {
          return dir * a.description.localeCompare(b.description, 'pt-BR', { sensitivity: 'base' });
        }
        case 'amount': {
          return dir * ((Number(a.amount) || 0) - (Number(b.amount) || 0));
        }
        case 'type': {
          return dir * String(a.type).localeCompare(String(b.type), 'pt-BR', { sensitivity: 'base' });
        }
        case 'paymentMethod': {
          return dir * String(a.paymentMethod || '').localeCompare(String(b.paymentMethod || ''), 'pt-BR', { sensitivity: 'base' });
        }
        case 'date':
        default: {
          return dir * (new Date(a.date + 'T00:00:00').getTime() - new Date(b.date + 'T00:00:00').getTime());
        }
      }
    });
    return list;
  }, [filteredBySearch, sortDirection, sortField]);

  const groupedTransactions = React.useMemo<Record<string, Transaction[]> | null>(() => {
    if (monthFilter !== 'all') {
      return null;
    }

    return sortedTransactions.reduce((acc: Record<string, Transaction[]>, transaction) => {
      const date = new Date(transaction.date + 'T00:00:00');
      const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(transaction);
      return acc;
    }, {});
  }, [sortedTransactions, monthFilter]);


  const renderTransactionList = (list: Transaction[]) => (
    <AnimatePresence initial={false}>
      <motion.ul layout className="space-y-4">
        {list.map(transaction => (
          <TransactionItem key={transaction.id} transaction={transaction} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </motion.ul>
    </AnimatePresence>
  );

  return (
    <div className="bg-white p-4 md:p-8 rounded-[var(--radius-lg)] border border-gray-100 shadow-[var(--card-shadow)] flex flex-col min-h-[500px] md:min-h-[680px]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
            <i className="fas fa-list-ul"></i>
          </div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Histórico de Gastos</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {showSorting && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordenar</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-transparent border-none text-xs font-black text-gray-600 uppercase tracking-widest focus:outline-none cursor-pointer"
              >
                <option value="date">Data</option>
                <option value="description">Nome</option>
                <option value="amount">Valor</option>
                <option value="type">Tipo</option>
                <option value="paymentMethod">Pagamento</option>
              </select>
              <button
                type="button"
                onClick={() => setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
                title={sortDirection === 'asc' ? 'Crescente' : 'Decrescente'}
              >
                <i className={`fas ${sortDirection === 'asc' ? 'fa-arrow-up-short-wide' : 'fa-arrow-down-short-wide'}`}></i>
              </button>
            </div>
          )}

          {showFilters && (
            <>
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
            </>
          )}

          {onAnalyze && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IA</span>
              <select
                value={selectedAnalyzeScope}
                onChange={(e) => setSelectedAnalyzeScope(e.target.value as 'all' | 'pending')}
                disabled={isAnalyzing}
                className="bg-transparent border-none text-xs font-black text-gray-600 uppercase tracking-widest focus:outline-none cursor-pointer"
                title="Escopo da análise"
              >
                <option value="pending">A verificar</option>
                <option value="all">Tudo</option>
              </select>
              <button
                type="button"
                onClick={() => onAnalyze(selectedAnalyzeScope)}
                disabled={isAnalyzing}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
                title="Classificar com IA"
              >
                {isAnalyzing ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-wand-magic-sparkles"></i>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {isAnalyzing && aiProgress?.total ? (
        <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 mb-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Atualizando com IA</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {aiProgress.current} de {aiProgress.total}
            </span>
          </div>
          <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-gray-100">
            <div
              className="h-full bg-[var(--primary)] transition-all"
              style={{ width: `${Math.min(100, Math.round((aiProgress.current / aiProgress.total) * 100))}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-8" />
      )}

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
            renderTransactionList(sortedTransactions)
          )}
        </div>
      </div>

    </div>
  );
};

export default TransactionList;
