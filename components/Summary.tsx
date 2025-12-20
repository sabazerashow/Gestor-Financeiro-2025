import React, { useMemo } from 'react';
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

const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE'];

const Summary: React.FC<SummaryProps> = ({ income, expense, balance, transactions = [], currentMonth, onMonthChange }) => {
  const balanceColor = balance >= 0 ? 'text-[#111111]' : 'text-red-500';

  // Process Daily Balance Behavior
  const balanceHistory = useMemo(() => {
    if (!transactions.length) return [];

    // Group by day
    const daily = transactions.reduce((acc, t) => {
      const day = t.date.slice(8, 10);
      const val = t.type === TransactionType.INCOME ? t.amount : -t.amount;
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
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between h-64 relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-500">
              <i className="fas fa-arrow-trend-up"></i>
            </div>
            <span className="text-gray-400 font-bold text-xs tracking-widest uppercase">Entradas do Mês</span>
          </div>
          <p className="text-3xl font-black text-green-500 tracking-tight mt-2">{formatCurrency(income)}</p>
        </div>
        <div className="space-y-2 mt-4 z-10">
          {incomeBreakdown.length > 0 ? incomeBreakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                <span className="text-gray-500 font-medium truncate max-w-[100px]">{item.name}</span>
              </div>
              <span className="font-bold text-gray-900">{formatCurrency(item.value)}</span>
            </div>
          )) : <p className="text-gray-300 text-xs italic">Sem dados de entrada</p>}
        </div>
      </div>

      {/* Balance Card with Wave */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between h-64 relative overflow-hidden text-center p-6">
        <div className="z-10 relative">
          <span className="text-gray-400 font-bold text-xs tracking-widest uppercase block mb-2">Saldo Total</span>
          <p className={`text-4xl font-black tracking-tighter ${balanceColor}`}>{formatCurrency(balance)}</p>
          <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest mt-1 block">Status Atual</span>
        </div>

        {/* Balance Evolution Sparkline */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-80 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={balanceHistory}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="balance"
                stroke="var(--primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorBalance)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-between px-8 text-[10px] font-bold text-gray-400 z-20">
          <span>Início</span>
          <span>Dia 15</span>
          <span>Hoje</span>
        </div>
      </div>

      {/* Expense Card with Chart */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-64 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
            <i className="fas fa-arrow-trend-down"></i>
          </div>
          <span className="text-gray-400 font-bold text-xs tracking-widest uppercase">Saídas do Mês</span>
        </div>
        <p className="text-3xl font-black text-red-500 tracking-tight">{formatCurrency(expense)}</p>

        <div className="flex items-center mt-4 h-full">
          <div className="w-1/2 h-full min-h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-1 pl-2">
            {expenseBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 truncate">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-gray-500 font-bold truncate max-w-[60px]" title={item.name}>{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{Math.round((item.value / expense) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Summary;
