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
  const amountColor = isIncome ? 'text-income' : 'text-expense';
  const borderColor = isIncome ? 'border-[var(--chart-2)]' : 'border-[var(--destructive)]';

  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount);
  const transactionDate = new Date(transaction.date + 'T00:00:00');
  const formattedDate = transactionDate.toLocaleDateString('pt-BR');

  const categoryInfo = transaction.category ? categories[transaction.category] : null;
  const paymentInfo = transaction.paymentMethod ? paymentMethodDetails[transaction.paymentMethod] : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isFuture = transactionDate > today;

  return (
    <li className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[var(--surface)] rounded-lg border-l-4 ${borderColor} transition-all hover:shadow-md ${isFuture ? 'opacity-70' : ''}`}>
      <div className="flex-grow min-w-0 flex items-center space-x-3 w-full">
        {transaction.isRecurring && (
            <i className="fas fa-sync-alt text-[var(--primary)]" title="Débito Automático"></i>
        )}
        {isFuture && (
            <i className="fas fa-clock text-[var(--primary)]" title="Lançamento futuro"></i>
        )}
        <div className="flex-grow min-w-0">
            <p className="font-semibold text-[var(--color-text)] truncate flex items-center">
                {transaction.description}
                {transaction.installmentDetails && (
                    <span className="ml-2 text-xs font-mono bg-[var(--surface)] px-1.5 py-0.5 rounded">
                        {transaction.installmentDetails.current}/{transaction.installmentDetails.total}
                    </span>
                )}
            </p>
            <div className="flex items-center space-x-2 mt-1 flex-wrap">
            <p className="text-sm text-[var(--color-text-muted)]">{formattedDate}</p>
            {transaction.category && categoryInfo && (
                <>
                <span className="text-sm text-[var(--color-text-muted)]">·</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]`}>
                    <i className={`fas ${categoryInfo.icon || 'fa-tag'} mr-1`}></i>
                    {transaction.category} {transaction.subcategory && `> ${transaction.subcategory}`}
                </span>
                </>
            )}
            {transaction.paymentMethod && paymentInfo && (
                <>
                <span className="text-sm text-[var(--color-text-muted)]">·</span>
                 <span className={`text-xs font-medium flex items-center ${paymentInfo.color}`}>
                    <i className={`fas ${paymentInfo.icon} mr-1`}></i>
                    {transaction.paymentMethod}
                </span>
                </>
            )}
            </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4 sm:ml-4 self-end mt-2 sm:mt-0">
        <span className={`font-bold whitespace-nowrap ${amountColor}`}>{formattedAmount}</span>
        <button
          onClick={() => onEdit(transaction)}
          className="text-[var(--color-text-muted)] hover:text-[var(--primary)] transition-colors"
          aria-label={`Editar transação ${transaction.description}`}
        >
          <i className="fas fa-pencil-alt"></i>
        </button>
        <button
          onClick={() => onDelete(transaction)}
          className="text-[var(--color-text-muted)] hover:text-[var(--danger)] transition-colors"
          aria-label={`Deletar transação ${transaction.description}`}
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
    </li>
  );
};

export default TransactionItem;
