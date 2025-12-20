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
    const filtered = transactions.filter(t =>
      t.paymentMethod &&
      paymentMethods.includes(t.paymentMethod)
    );

    // FIX: Explicitly cast 't.amount' to a number to prevent type errors.
    const total = filtered.reduce((acc: number, t) => acc + (Number(t.amount) || 0), 0);

    const byCategory = filtered.reduce((acc: { [key: string]: number }, t) => {
      const category = t.category || 'Outros';
      // FIX: Explicitly cast 't.amount' to a number to prevent type errors.
      acc[category] = (acc[category] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

    const palette = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

    const categoryBreakdown = Object.entries(byCategory)
      .map(([category, amount], idx) => ({
        category,
        amount,
        color: palette[idx % palette.length],
        icon: categories[category]?.icon || 'fa-tag',
      }))
      .sort((a, b) => (b.amount as number) - (a.amount as number));

    return { total, categoryBreakdown };
  }, [transactions, paymentMethods]);


  const pieChartData = data.categoryBreakdown.map(item => ({
    label: item.category,
    value: item.amount,
    color: item.color,
  }));

  return (
    <div className="p-8 h-full flex flex-col bg-white rounded-[32px] border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
          <i className={`fas ${icon}`}></i>
        </div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</h2>
      </div>

      {data.total === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-300">
          <i className="fas fa-inbox text-4xl mb-3"></i>
          <p className="text-sm italic">Nenhuma despesa no período.</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.total)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-48">
              <CategoryPieChart data={pieChartData} />
            </div>
            <ul className="space-y-2 text-sm">
              {data.categoryBreakdown.slice(0, 5).map(item => (
                <li key={item.category} className="flex items-center justify-between p-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-500 font-medium text-xs">{item.category}</span>
                  </div>
                  <span className="font-bold text-gray-900 text-xs">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}</span>
                </li>
              ))}
              {data.categoryBreakdown.length > 5 && (
                <li className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">...e mais {data.categoryBreakdown.length - 5}</li>
              )}
            </ul>
          </div>
          {footer && <div className="mt-4 border-t border-gray-100 pt-4">{footer}</div>}
        </>
      )}
    </div>
  );
};

export default SpendingByCategoryCard;
