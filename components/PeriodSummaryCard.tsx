import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface PeriodSummaryCardProps {
    transactions: Transaction[];
}

const StatCard: React.FC<{ title: string; value: string; icon: string; colorClass?: string; helpText?: string }> = ({ title, value, icon, colorClass = 'text-[var(--color-text)]', helpText }) => (
    <div className="bg-[var(--surface)] p-4 rounded-xl flex flex-col justify-between transition-all hover:bg-gray-50 border border-transparent hover:border-gray-100 group" title={helpText}>
        <div className="flex items-center text-gray-400 mb-2">
            <i className={`fas ${icon} fa-fw mr-2 text-xs`}></i>
            <h3 className="text-[10px] font-bold uppercase tracking-widest truncate">{title}</h3>
        </div>
        <p className={`text-xl sm:text-2xl font-black mt-1 ${colorClass} whitespace-nowrap tabular-nums tracking-tight`}>{value}</p>
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
        <div className="p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <i className="fas fa-chart-pie"></i>
                </div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">RESUMO DO PERÍODO</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <StatCard
                    title="Receitas"
                    value={formatCurrency(summary.income)}
                    icon="fa-arrow-up"
                    colorClass="text-[#2ab29a]"
                />
                <StatCard
                    title="Despesas"
                    value={formatCurrency(summary.expenseTotal)}
                    icon="fa-arrow-down"
                    colorClass="text-red-500"
                />
                <StatCard
                    title="Saldo"
                    value={formatCurrency(summary.balance)}
                    icon="fa-scale-balanced"
                    colorClass={summary.balance >= 0 ? 'text-[#2ab29a]' : 'text-red-500'}
                />
                <StatCard
                    title="Taxa de Poupança"
                    value={formatPercentage(summary.savingsRate)}
                    icon="fa-piggy-bank"
                    colorClass="text-[#2ab29a]"
                    helpText="Percentual da sua receita que foi economizado."
                />
                <StatCard
                    title="Taxa de Gasto"
                    value={formatPercentage(summary.spendingRate)}
                    icon="fa-credit-card"
                    colorClass="text-red-500"
                    helpText="Percentual da sua receita que foi gasto."
                />
                <StatCard
                    title="Gastos Comprometidos"
                    value={formatCurrency(summary.committedSpending)}
                    icon="fa-lock"
                    colorClass="text-gray-900"
                    helpText="Soma de gastos à vista e o valor total de novas compras parceladas."
                />
            </div>
        </div>
    );
};

export default PeriodSummaryCard;
