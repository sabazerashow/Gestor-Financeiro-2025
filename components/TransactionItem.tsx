import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="flex items-center justify-between p-3 md:p-5 bg-white rounded-2xl border border-gray-50/50 hover:border-[var(--primary)]/30 hover:shadow-md transition-all group cursor-pointer"
      onClick={() => onEdit(transaction)}
    >
      <div className="flex items-center gap-5 flex-1 min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${isIncome ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'} group-hover:scale-110`}>
          <i className={`fas ${categoryInfo?.icon || 'fa-tag'}`}></i>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 line-clamp-2 tracking-tight text-sm md:text-base mb-0.5 leading-tight">{transaction.description}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#2ab29a] bg-emerald-50 px-2 py-0.5 rounded-lg whitespace-nowrap">{transaction.category}</span>
            <span className="text-gray-300 text-[10px] hidden md:inline">•</span>
            <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{formattedDate}</span>

            {transaction.createdByName && (
              <div className="flex items-center gap-1.5 ml-2 px-1.5 py-0.5 rounded-full bg-gray-50 border border-gray-100/50">
                <div
                  className="w-4 h-4 rounded-full bg-gray-900 text-white flex items-center justify-center text-[8px] font-black uppercase"
                >
                  {transaction.createdByName.charAt(0)}
                </div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-wide max-w-[50px] truncate">
                  {transaction.createdByName.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right flex flex-col items-end">
          <p className={`text-base md:text-lg font-black tracking-tight whitespace-nowrap ${isIncome ? 'text-emerald-500' : 'text-gray-900'}`}>
            {isIncome ? `+${formattedAmount}` : formattedAmount}
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] whitespace-nowrap">{transaction.paymentMethod || 'OUTRO'}</span>
            {paymentInfo?.icon && <i className={`fas ${paymentInfo.icon} text-[8px] md:text-[10px] text-gray-400`}></i>}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(transaction); }}
            className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
            title="Excluir Lançamento"
          >
            <i className="fas fa-trash-alt text-xs"></i>
          </button>
        </div>
      </div>
    </motion.li >
  );
};

export default TransactionItem;
