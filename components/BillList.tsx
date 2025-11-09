import React from 'react';
import { Bill } from '../types';

interface BillListProps {
  bills: Bill[];
  onDelete: (id: string) => void;
}

const BillItem: React.FC<{ bill: Bill; onDelete: (id: string) => void }> = ({ bill, onDelete }) => {
  return (
    <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-shadow hover:shadow-md">
      <div className="flex-grow min-w-0 flex items-center space-x-3">
        {bill.isAutoDebit ? (
            <i className="fas fa-check-circle text-green-500" title="Em Débito Automático"></i>
        ) : (
            <i className="fas fa-exclamation-circle text-yellow-500" title="Pagamento Manual"></i>
        )}
        <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{bill.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Vence todo dia {String(bill.dueDay).padStart(2, '0')}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 ml-4">
        <button
          onClick={() => onDelete(bill.id)}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          aria-label={`Deletar conta ${bill.description}`}
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
    </li>
  );
};

const BillList: React.FC<BillListProps> = ({ bills, onDelete }) => {
    const sortedBills = [...bills].sort((a, b) => a.dueDay - b.dueDay);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Contas Cadastradas</h2>
        {bills.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma conta cadastrada.</p>
        ) : (
            <ul className="space-y-3">
            {sortedBills.map(bill => (
                <BillItem key={bill.id} bill={bill} onDelete={onDelete} />
            ))}
            </ul>
        )}
        </div>
    );
};

export default BillList;
