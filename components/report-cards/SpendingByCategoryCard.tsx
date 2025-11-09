

import React, { useMemo } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '../../types';
import { categories } from '../../categories';
import CategoryPieChart from '../charts/CategoryPieChart';

interface SpendingByCategoryCardProps {
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  title: string;
  icon: string;
  footer?: React.ReactNode;
}

const SpendingByCategoryCard: React.FC<SpendingByCategoryCardProps> = ({ transactions, paymentMethods, title, icon, footer }) => {
  const data = useMemo(() => {
    const filteredExpenses = transactions.filter(t => 
      t.type === TransactionType.EXPENSE &&
      t.paymentMethod &&
      paymentMethods.includes(t.paymentMethod)
    );

    // FIX: Explicitly cast 't.amount' to a number to prevent type errors.
    const total = filteredExpenses.reduce((acc: number, t) => acc + (Number(t.amount) || 0), 0);

    const byCategory = filteredExpenses.reduce((acc: { [key: string]: number }, t) => {
      const category = t.category || 'Outros';
      // FIX: Explicitly cast 't.amount' to a number to prevent type errors.
      acc[category] = (acc[category] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(byCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        color: categories[category]?.color || 'bg-gray-400',
        icon: categories[category]?.icon || 'fa-tag',
      }))
      .sort((a, b) => b.amount - a.amount);

    return { total, categoryBreakdown };
  }, [transactions, paymentMethods]);


  const pieChartData = data.categoryBreakdown.map(item => ({
    label: item.category,
    value: item.amount,
    color: item.color,
  }));

  return (
    <div className="p-6 col-span-1 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
        <i className={`fas ${icon} text-2xl text-gray-400 dark:text-gray-500`}></i>
      </div>
      {data.total === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <i className="fas fa-inbox text-4xl mb-3"></i>
            <p>Nenhuma despesa no período.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Gasto no Período</p>
              <p className="text-3xl font-bold text-expense">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.total)}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-48">
                  <CategoryPieChart data={pieChartData} />
              </div>
              <ul className="space-y-1 text-sm">
                {data.categoryBreakdown.slice(0, 5).map(item => (
                  <li key={item.category} className="flex items-center justify-between p-1 rounded">
                      <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                          <span className="text-gray-600 dark:text-gray-300">{item.category}</span>
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-200">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}</span>
                  </li>
                ))}
                {data.categoryBreakdown.length > 5 && (
                  <li className="text-center text-xs text-gray-400 pt-1">...e mais {data.categoryBreakdown.length - 5} categorias</li>
                )}
              </ul>
            </div>
            {footer && <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-2">{footer}</div>}
          </>
      )}
    </div>
  );
};

export default SpendingByCategoryCard;
