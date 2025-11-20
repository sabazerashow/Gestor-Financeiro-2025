
import React from 'react';

interface SummaryProps {
  income: number;
  expense: number;
  balance: number;
}

const SummaryCard: React.FC<{ title: string; amount: number; icon: string; colorClass: string }> = ({ title, amount, icon, colorClass }) => {
    const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
    return (
        <div className="bg-[var(--card)] p-6 rounded-xl shadow-sm flex items-center space-x-4 transition-all hover:shadow-md hover:-translate-y-0.5 will-change-transform">
            <div className={`text-3xl p-3 rounded-full ${colorClass}`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <div>
                <p className="text-sm text-[var(--color-text-muted)] font-medium">{title}</p>
                <p className="text-2xl font-bold text-[var(--color-text)] whitespace-nowrap">{formattedAmount}</p>
            </div>
        </div>
    );
};


const Summary: React.FC<SummaryProps> = ({ income, expense, balance }) => {
  const balanceColor = balance >= 0 ? 'text-income bg-income' : 'text-expense bg-expense';
  const balanceIcon = balance >= 0 ? 'fa-scale-balanced' : 'fa-hand-holding-dollar';
    
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <SummaryCard title="Receitas" amount={income} icon="fa-arrow-up" colorClass="text-income bg-income" />
      <SummaryCard title="Despesas" amount={expense} icon="fa-arrow-down" colorClass="text-expense bg-expense" />
      <SummaryCard title="Saldo" amount={balance} icon={balanceIcon} colorClass={balanceColor} />
    </section>
  );
};

export default Summary;
