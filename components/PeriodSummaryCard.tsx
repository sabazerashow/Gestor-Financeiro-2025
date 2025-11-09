
import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface PeriodSummaryCardProps {
  transactions: Transaction[];
}

const StatCard: React.FC<{ title: string; value: string; icon: string; colorClass?: string; helpText?: string }> = ({ title, value, icon, colorClass = 'text-gray-800 dark:text-white', helpText }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-0.5 will-change-transform" title={helpText}>
        <div className="flex items-center text-gray-500 dark:text-gray-400">
            <i className={`fas ${icon} fa-fw mr-2`}></i>
            <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <p className={`text-xl sm:text-2xl font-bold mt-1 ${colorClass} whitespace-nowrap tabular-nums`}>{value}</p>
    </div>
);

const PeriodSummaryCard: React.FC<PeriodSummaryCardProps> = ({ transactions }) => {

  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);

    const expenseTotal = expenses.reduce((acc, t) => acc + Number(t.amount), 0);

    const balance = income - expenseTotal;

    const savingsRate = income > 0 ? (balance / income) * 100 : 0;
    const spendingRate = income > 0 ? (expenseTotal / income) * 100 : 0;

    const oneTimeExpenses = expenses
        .filter(t => !t.installmentDetails)
        .reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Sum the total amount of new installment purchases initiated in the period
    const newInstallmentsTotal = expenses
        .filter(t => t.installmentDetails?.current === 1)
        .reduce((sum, t) => sum + t.installmentDetails!.totalAmount, 0);

    const committedSpending = oneTimeExpenses + newInstallmentsTotal;

    return {
        income,
        expenseTotal,
        balance,
        savingsRate,
        spendingRate,
        committedSpending
    };

  }, [transactions]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="p-6 col-span-1 lg:col-span-2">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Resumo do Período</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard 
                title="Receitas"
                value={formatCurrency(summary.income)}
                icon="fa-arrow-up"
                colorClass="text-income"
            />
            <StatCard 
                title="Despesas"
                value={formatCurrency(summary.expenseTotal)}
                icon="fa-arrow-down"
                colorClass="text-expense"
            />
             <StatCard 
                title="Saldo"
                value={formatCurrency(summary.balance)}
                icon="fa-scale-balanced"
                colorClass={summary.balance >= 0 ? 'text-income' : 'text-expense'}
            />
            <StatCard 
                title="Taxa de Poupança"
                value={formatPercentage(summary.savingsRate)}
                icon="fa-piggy-bank"
                colorClass="text-indigo-500"
                helpText="Percentual da sua receita que foi economizado."
            />
            <StatCard 
                title="Taxa de Gasto"
                value={formatPercentage(summary.spendingRate)}
                icon="fa-credit-card"
                colorClass="text-orange-500"
                helpText="Percentual da sua receita que foi gasto."
            />
            <StatCard 
                title="Gastos Comprometidos"
                value={formatCurrency(summary.committedSpending)}
                icon="fa-lock"
                colorClass="text-yellow-600 dark:text-yellow-400"
                helpText="Soma de gastos à vista e o valor total de novas compras parceladas."
            />
        </div>
    </div>
  );
};

export default PeriodSummaryCard;

