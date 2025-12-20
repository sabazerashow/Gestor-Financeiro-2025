import React from 'react';
import { Transaction, TransactionType, paymentMethodDetails } from '../types';
import { categories } from '../categories';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === TransactionType.INCOME;
  const amountColor = isIncome ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]';
  const iconBg = isIncome ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--muted)] text-[var(--color-text-muted)]';

  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount);
  const transactionDate = new Date(transaction.date + 'T00:00:00');
  const formattedDate = transactionDate.toLocaleDateString('pt-BR');

  const categoryInfo = transaction.category ? categories[transaction.category] : null;
  const paymentInfo = transaction.paymentMethod ? paymentMethodDetails[transaction.paymentMethod] : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isFuture = transactionDate > today;

  return (
    <li
      className="flex items-center justify-between p-5 bg-white rounded-2xl border border-transparent hover:border-gray-50 hover:bg-gray-50/30 transition-all group cursor-pointer"
      onClick={() => onEdit(transaction)}
    >
      <div className="flex items-center space-x-5 flex-1 min-w-0">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-xl text-gray-400 border border-gray-100 group-hover:bg-white group-hover:border-[var(--primary)]/20 transition-all">
          <i className={`fas ${categoryInfo?.icon || 'fa-tag'}`}></i>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 truncate tracking-tight text-base">{transaction.description}</p>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-400 font-medium">{transaction.category}</span>
            <span className="text-gray-200 text-[10px]">•</span>
            <span className="text-xs text-gray-400 font-medium">{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className={`text-lg font-bold tracking-tight ${isIncome ? 'text-[#2ab29a]' : 'text-gray-900'}`}>
            {isIncome ? `+${formattedAmount}` : formattedAmount}
          </p>
          <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-widest mt-0.5">{transaction.paymentMethod || 'Other'}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(transaction); }}
            className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <i className="fas fa-trash-alt text-sm"></i>
          </button>
        </div>
      </div>
    </li>
  );
};

export default TransactionItem;
