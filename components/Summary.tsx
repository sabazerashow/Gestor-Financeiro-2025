import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Transaction, TransactionType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';

interface SummaryProps {
  income: number;
  expense: number;
  balance: number;
  transactions?: Transaction[];
  currentMonth: string;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

const COLORS = ['#2ab29a', '#3b82f6', '#8b5cf6', '#f59e0b'];

const Summary: React.FC<SummaryProps> = ({ income, expense, balance, transactions = [], currentMonth, onMonthChange }) => {
  const balanceColor = balance >= 0 ? 'text-[#111111]' : 'text-red-500';

  // Process Daily Balance Behavior
  const balanceHistory = useMemo(() => {
    if (!transactions.length) {
      // Return a flat line if no transactions for better visual than empty chart
      return Array.from({ length: 31 }, (_, i) => ({
        day: String(i + 1).padStart(2, '0'),
        balance: 0
      }));
    }

    // Group by day
    const daily = transactions.reduce((acc, t) => {
      const day = t.date.slice(8, 10);
      const val = t.type === TransactionType.INCOME ? (Number(t.amount) || 0) : -(Number(t.amount) || 0);
      acc[day] = (acc[day] || 0) + val;
      return acc;
    }, {} as Record<string, number>);

    // Calculate cumulative
    let cumulative = 0;
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    return days.map(day => {
      cumulative += (daily[day] || 0);
      return { day, balance: cumulative };
    });
  }, [transactions]);

  // Process Income Breakdown (Top 3 sources)
  const incomeBreakdown = useMemo(() => {
    const incomeTx = transactions.filter(t => t.type === TransactionType.INCOME);
    const grouped = incomeTx.reduce((acc, t) => {
      const cat = t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Process Expense Breakdown (for Chart)
  const expenseBreakdown = useMemo(() => {
    const expenseTx = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const grouped = expenseTx.reduce((acc, t) => {
      const cat = t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3) // Top 3 for chart/legend
      .map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Income Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white p-8 rounded-[var(--radius-lg)] border border-gray-100 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all flex flex-col justify-between h-72 relative overflow-hidden group"
      >
        <div className="z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fas fa-arrow-trend-up text-xl"></i>
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase block">Entradas</span>
              <p className="text-2xl font-black text-emerald-500 tracking-tight">{formatCurrency(income)}</p>
            </div>
          </div>
        </div>
        <div className="space-y-3 mt-4 z-10">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50 pb-2">Principais Fontes</p>
          {incomeBreakdown.length > 0 ? incomeBreakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-bold text-gray-500 truncate max-w-[120px]">{item.name}</span>
              </div>
              <span className="text-xs font-black text-gray-900">{formatCurrency(item.value)}</span>
            </div>
          )) : <p className="text-gray-300 text-xs italic">Sem dados de entrada</p>}
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-[var(--radius-lg)] border border-gray-100 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all flex flex-col items-center justify-center h-72 relative overflow-hidden text-center p-8 group"
      >
        <div className="z-10 relative">
          <div className="w-14 h-14 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-4 mx-auto group-hover:rotate-12 transition-transform">
            <i className="fas fa-vault text-2xl"></i>
          </div>
          <span className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase block mb-1">Saldo Líquido</span>
          <p className={`text-4xl font-black tracking-tighter ${balanceColor}`}>{formatCurrency(balance)}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
            <span className={`w-2 h-2 rounded-full ${balance >= 0 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{balance >= 0 ? 'Positivo' : 'Negativo'}</span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="absolute bottom-0 left-0 right-0 h-28 opacity-60 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={balanceHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="balance"
                stroke="var(--primary)"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Expense Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white p-8 rounded-[var(--radius-lg)] border border-gray-100 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all flex flex-col h-72 relative overflow-hidden group"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <i className="fas fa-arrow-trend-down text-xl"></i>
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase block">Saídas</span>
            <p className="text-2xl font-black text-red-500 tracking-tight">{formatCurrency(expense)}</p>
          </div>
        </div>

        <div className="flex items-center flex-1 min-h-0">
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={100}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-2 pl-4">
            {expenseBreakdown.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase truncate max-w-[70px]">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-gray-900">{Math.round((item.value / expense) * 100)}%</span>
                </div>
                <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: COLORS[idx % COLORS.length],
                      width: `${(item.value / expense) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Summary;
