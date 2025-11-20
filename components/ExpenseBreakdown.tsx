
import React from 'react';
import { CategoryExpense } from '../types';

interface ExpenseBreakdownProps {
  data: CategoryExpense[];
  title?: string;
}

const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({ data, title = "Despesas por Categoria" }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-[var(--color-text)]">{title}</h2>
      {data.length === 0 ? (
        <p className="text-[var(--color-text-muted)] text-center py-8">Nenhuma despesa registrada neste período.</p>
      ) : (
        <ul className="space-y-4">
          {data.map(({ category, amount, percentage, color, icon }) => (
            <li key={category}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center space-x-2">
                    <i className={`fas ${icon} text-[var(--color-text-muted)]`}></i>
                    <span className="font-medium text-[var(--color-text-muted)]">{category}</span>
                </div>
                <span className="font-semibold text-[var(--color-text)]">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-full bg-[var(--surface)] rounded-full h-2.5">
                  <div
                    className={`${color} h-2.5 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-[var(--color-text-muted)] w-12 text-right">{percentage.toFixed(0)}%</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpenseBreakdown;