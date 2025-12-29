import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
    const filtered = transactions.filter(t => {
      // If no paymentMethods filter provided, include all of the right type
      if (!paymentMethods || paymentMethods.length === 0) return true;

      // If paymentMethod is missing on transaction, include it anyway to avoid empty reports
      // BUT only if we are showing "all" or it's a category breakdown card
      if (!t.paymentMethod) return true;

      return paymentMethods.includes(t.paymentMethod);
    });

    const total = filtered.reduce((acc: number, t) => acc + (Number(t.amount) || 0), 0);

    const byCategory = filtered.reduce((acc: { [key: string]: number }, t) => {
      const category = t.category || 'Outros';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 h-full flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors duration-500 shadow-inner">
            <i className={`fas ${icon} text-sm`}></i>
          </div>
          <div>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</h2>
          </div>
        </div>
      </div>

      {data.total === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-4 border border-gray-50">
            <i className="fas fa-inbox text-2xl"></i>
          </div>
          <p className="text-sm font-medium text-gray-400 italic">Nenhum dado para exibir</p>
        </div>
      ) : (
        <div className="flex flex-col flex-grow">
          <div className="text-center mb-8 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Montante no Período</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter tabular-nums">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.total)}
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center flex-grow">
            <div className="h-44 flex items-center justify-center">
              <CategoryPieChart data={pieChartData} />
            </div>
            <ul className="space-y-1.5 list-none m-0 p-0">
              {data.categoryBreakdown.slice(0, 5).map((item, index) => (
                <motion.li
                  key={item.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600 font-bold text-[11px] truncate max-w-[100px]">{item.category}</span>
                  </div>
                  <span className="font-black text-gray-900 text-xs tabular-nums">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                  </span>
                </motion.li>
              ))}
              {data.categoryBreakdown.length > 5 && (
                <li className="text-center text-[9px] font-black text-gray-400 uppercase tracking-widest pt-3 border-t border-gray-50 mt-2">
                  Mais {data.categoryBreakdown.length - 5} categorias...
                </li>
              )}
            </ul>
          </div>
          {footer && footer}
        </div>
      )}
    </motion.div>
  );
};

export default SpendingByCategoryCard;
