import React from 'react';
import { CategoryIncome } from '../types';

interface IncomeBreakdownProps {
  data: CategoryIncome[];
  title?: string;
}

const IncomeBreakdown: React.FC<IncomeBreakdownProps> = ({ data, title = "Receitas por Categoria" }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h2>
      {data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhuma receita registrada neste período.</p>
      ) : (
        <ul className="space-y-4">
          {data.map(({ category, amount, percentage, color, icon }) => (
            <li key={category}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center space-x-2">
                    <i className={`fas ${icon} text-gray-500 dark:text-gray-400`}></i>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{category}</span>
                </div>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`${color} h-2.5 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-12 text-right">{percentage.toFixed(0)}%</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IncomeBreakdown;