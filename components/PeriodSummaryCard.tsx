import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Transaction, TransactionType } from '../types';

interface PeriodSummaryCardProps {
    transactions: Transaction[];
}

const StatCard: React.FC<{ title: string; value: string; icon?: string; colorClass?: string; helpText?: string; delay?: number }> = ({ title, value, icon, colorClass = 'text-gray-900', helpText, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -4, backgroundColor: 'rgba(255, 255, 255, 1)' }}
        className="bg-gray-50/50 p-6 rounded-3xl flex flex-col justify-between transition-all border border-transparent hover:border-gray-100 hover:shadow-xl group relative overflow-hidden"
        title={helpText}
    >
        <div className="flex items-center text-gray-400 mb-4 z-10">
            {icon && (
                <div className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center mr-3 group-hover:scale-110 transition-transform ${colorClass.replace('text-', 'bg-').split(' ')[0]}/10`}>
                    <i className={`fas ${icon} fa-fw text-[10px]`}></i>
                </div>
            )}
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] truncate">{title}</h3>
        </div>
        <p className={`text-2xl sm:text-3xl font-black mt-1 ${colorClass} whitespace-nowrap tabular-nums tracking-tighter z-10`}>{value}</p>

        {/* Decorative background icon */}
        {icon && <i className={`fas ${icon} absolute -bottom-4 -right-4 text-6xl opacity-[0.02] group-hover:opacity-[0.05] transition-opacity`}></i>}
    </motion.div>
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

        // "Comprometido" should reflect everything already spent this month 
        // PLUS the remaining value of new installment purchases made in this period.
        const futureDebtFromNewPurchases = expenses
            .filter(t => t.installmentDetails?.current === 1)
            .reduce((sum, t) => {
                const total = t.installmentDetails!.totalAmount;
                const paidNow = Number(t.amount);
                return sum + Math.max(0, total - paidNow);
            }, 0);

        const committedSpending = expenseTotal + futureDebtFromNewPurchases;

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
                        <i className="fas fa-chart-line text-xl"></i>
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Performance</h2>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Fluxo de Caixa</h3>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
                        {summary.balance >= 0 ? 'Lucrativo' : 'Déficit'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Receitas"
                    value={formatCurrency(summary.income)}
                    colorClass="text-emerald-500"
                    delay={0.1}
                />
                <StatCard
                    title="Despesas"
                    value={formatCurrency(summary.expenseTotal)}
                    colorClass="text-rose-500"
                    delay={0.2}
                />
                <StatCard
                    title="Saldo Real"
                    value={formatCurrency(summary.balance)}
                    icon="fa-scale-balanced"
                    colorClass={summary.balance >= 0 ? 'text-blue-500' : 'text-rose-500'}
                    delay={0.3}
                />
                <StatCard
                    title="Taxa Poupança"
                    value={formatPercentage(summary.savingsRate)}
                    icon="fa-piggy-bank"
                    colorClass="text-emerald-500"
                    helpText="Percentual da sua receita que foi economizado."
                    delay={0.4}
                />
                <StatCard
                    title="Taxa Consumo"
                    value={formatPercentage(summary.spendingRate)}
                    icon="fa-receipt"
                    colorClass="text-rose-500"
                    helpText="Percentual da sua receita que foi gasto."
                    delay={0.5}
                />
                <StatCard
                    title="Comprometido"
                    value={formatCurrency(summary.committedSpending)}
                    icon="fa-handshake-angle"
                    colorClass="text-gray-900"
                    helpText="Soma de gastos à vista e o valor total de novas compras parceladas."
                    delay={0.6}
                />
            </div>

            {/* Background decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        </motion.div>
    );
};

export default PeriodSummaryCard;
