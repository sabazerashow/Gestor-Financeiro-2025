import React from 'react';
import { RecurringTransaction } from '../types';
import { categories } from '../categories';

interface RecurringTransactionListProps {
  transactions: RecurringTransaction[];
  onDelete: (id: string) => void;
}

const RecurringTransactionItem: React.FC<{ transaction: RecurringTransaction; onDelete: (id: string) => void }> = ({ transaction, onDelete }) => {
  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount);
  const nextDueDate = new Date(transaction.nextDueDate + 'T00:00:00').toLocaleDateString('pt-BR');
  const categoryInfo = categories[transaction.category];

  return (
    <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-indigo-500 transition-shadow hover:shadow-md">
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{transaction.description}</p>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Próximo Venc.: {nextDueDate}</p>
          {categoryInfo && (
            <>
              <span className="text-sm text-gray-400">·</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${categoryInfo.color || 'bg-gray-400'}`}>
                <i className={`fas ${categoryInfo.icon || 'fa-tag'} mr-1`}></i>
                {transaction.category} > {transaction.subcategory}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4 ml-4">
        <span className="font-bold whitespace-nowrap text-red-500">{formattedAmount}</span>
        <button
          onClick={() => onDelete(transaction.id)}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          aria-label={`Deletar débito automático ${transaction.description}`}
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
    </li>
  );
};


const RecurringTransactionList: React.FC<RecurringTransactionListProps> = ({ transactions, onDelete }) => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Débitos Automáticos Agendados</h2>
        {transactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum débito automático configurado.</p>
        ) : (
            <ul className="space-y-3">
            {sortedTransactions.map(transaction => (
                <RecurringTransactionItem key={transaction.id} transaction={transaction} onDelete={onDelete} />
            ))}
            </ul>
        )}
        </div>
    );
};

export default RecurringTransactionList;