
import React from 'react';

interface SummaryProps {
  income: number;
  expense: number;
  balance: number;
}

const SummaryCard: React.FC<{ title: string; amount: number; icon: string; colorClass: string }> = ({ title, amount, icon, colorClass }) => {
  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${colorClass}`}>
          <i className={`fas ${icon}`}></i>
        </div>
        <div className="text-gray-300">
          <i className="fas fa-ellipsis-h cursor-pointer hover:text-gray-400"></i>
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-2">{title}</p>
        <p className="text-3xl font-black text-gray-900 tracking-tight">{formattedAmount}</p>
      </div>
    </div>
  );
};


const Summary: React.FC<SummaryProps> = ({ income, expense, balance }) => {
  const balanceColor = balance >= 0 ? 'bg-[#e6f7f4] text-[#2ab29a]' : 'bg-red-50 text-red-500';
  const balanceIcon = balance >= 0 ? 'fa-chart-line' : 'fa-chart-line-down';

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <SummaryCard title="Receitas" amount={income} icon="fa-arrow-up" colorClass="bg-[#e6f7f4] text-[#2ab29a]" />
      <SummaryCard title="Despesas" amount={expense} icon="fa-arrow-down" colorClass="bg-red-50 text-red-500" />
      <SummaryCard title="Saldo" amount={balance} icon={balanceIcon} colorClass={balanceColor} />
    </section>
  );
};

export default Summary;
