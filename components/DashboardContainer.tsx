import React, { useMemo, useState } from 'react';
import Summary from './Summary';
import UpcomingPayments from './UpcomingPayments';
import TransactionList from './TransactionList';
import ActiveHeader from './ActiveHeader';
import BurnRateCard from './BurnRateCard';
import SuperAnalysisCard from './SuperAnalysisCard';
import CommitmentRadarCard from './CommitmentRadarCard';
import InsightsCarousel from './InsightsCarousel';
import { useFinanceStore } from '../lib/store';
import { Transaction, TransactionType } from '../types';

interface DashboardContainerProps {
    dashboardMonth: string;
    onMonthChange: (direction: 'prev' | 'next') => void;
    onPayBill: (billId: string, description?: string) => void;
    onEditTransaction: (tx: Transaction) => void;
    onDeleteTransaction: (tx: Transaction) => void;
    onOpenIncomeModal: () => void;
    onOpenExpenseModal: () => void;
    onAnalyzeWithAI?: () => void;
    isAnalyzing?: boolean;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
    dashboardMonth,
    onMonthChange,
    onPayBill,
    onEditTransaction,
    onDeleteTransaction,
    onOpenIncomeModal,
    onOpenExpenseModal,
    onAnalyzeWithAI,
    isAnalyzing = false
}) => {
    const { transactions, bills, budgets, goals, userProfile } = useFinanceStore();

    const currentMonthTransactions = useMemo(() => {
        return transactions.filter(t => t.date.startsWith(dashboardMonth));
    }, [transactions, dashboardMonth]);

    const mainSummary = useMemo(() => {
        const income = currentMonthTransactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const expense = currentMonthTransactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        return { income, expense, balance: income - expense };
    }, [currentMonthTransactions]);

    const dashboardMonthDisplay = useMemo(() => {
        const [year, month] = dashboardMonth.split('-');
        return new Date(Number(year), Number(month) - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    }, [dashboardMonth]);

    const notificationCount = useMemo(() => {
        // Conta notificações: contas urgentes + transações não classificadas
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const currentDay = today.getDate();

        const urgentBills = bills.filter(b => {
            // Conta está vencendo hoje ou amanhã?
            const isUrgent = b.dueDay === currentDay || b.dueDay === tomorrow.getDate();
            if (!isUrgent) return false;

            // Verifica se já foi paga
            const year = today.getFullYear();
            const month = today.getMonth() + 1;
            const billDateStr = `${year}-${String(month).padStart(2, '0')}-${String(b.dueDay).padStart(2, '0')}`;

            const alreadyPaid = currentMonthTransactions.some(t =>
                t.date === billDateStr &&
                t.description.toLowerCase().includes(b.description.toLowerCase())
            );

            return !alreadyPaid;
        }).length;

        const unclassified = currentMonthTransactions.filter(t =>
            t.category === 'A Verificar' || t.category === 'Outros'
        ).length;

        return urgentBills + unclassified;
    }, [bills, currentMonthTransactions]);

    return (
        <div className="space-y-8 pb-10">
            {/* Active Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <ActiveHeader
                    userName={userProfile.name || 'Usuário'}
                    notificationCount={notificationCount}
                    onOpenIncomeModal={onOpenIncomeModal}
                    onOpenExpenseModal={onOpenExpenseModal}
                    onOpenNotifications={() => {/* TODO: Implementar modal de notificações */ }}
                />

                {/* Month Selector */}
                <div className="flex items-center bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100/50 backdrop-blur-sm shadow-sm gap-2">
                    <button
                        onClick={() => onMonthChange('prev')}
                        className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase min-w-[200px] text-center">{dashboardMonthDisplay}</h2>
                    <button
                        onClick={() => onMonthChange('next')}
                        className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            {/* Budget Status (mantido do layout antigo) */}
            {budgets.length > 0 && (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
                            <i className="fas fa-piggy-bank text-xl"></i>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Status dos Orçamentos</h3>
                            <p className="text-xs text-gray-500">Acompanhamento de limites mensais</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-md">
                        {(() => {
                            const spentMap: Record<string, number> = {};
                            currentMonthTransactions
                                .filter(t => t.type === TransactionType.EXPENSE)
                                .forEach(t => spentMap[t.category] = (spentMap[t.category] || 0) + Number(t.amount));

                            const overCount = budgets.filter(b => (spentMap[b.category] || 0) > b.amount).length;
                            const totalBudgets = budgets.length;
                            const percentage = ((totalBudgets - overCount) / totalBudgets) * 100;

                            return (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-600">{overCount} de {totalBudgets} categorias excedidas</span>
                                        <span className={overCount > 0 ? 'text-orange-500' : 'text-emerald-500'}>
                                            {overCount === 0 ? 'Tudo sob controle!' : 'Atenção aos limites'}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${overCount > 0 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="hidden md:block h-10 w-px bg-gray-100"></div>

                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gasto Total Orçado</p>
                        <p className="text-xl font-black text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                budgets.reduce((sum, b) => sum + b.amount, 0)
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Hero Card: Burn Rate */}
            <BurnRateCard
                transactions={currentMonthTransactions}
                bills={bills}
                currentMonth={dashboardMonth}
            />

            {/* Middle Section: Super Card + Commitment Radar */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <SuperAnalysisCard transactions={currentMonthTransactions} />
                </div>
                <div className="xl:col-span-1">
                    <CommitmentRadarCard bills={bills} transactions={currentMonthTransactions} />
                </div>
            </div>

            {/* Insights Carousel */}
            <InsightsCarousel
                transactions={currentMonthTransactions}
                goals={goals}
                budgets={budgets}
                currentMonth={dashboardMonth}
                onAnalyzeWithAI={onAnalyzeWithAI}
                isAnalyzing={isAnalyzing}
            />
        </div>
    );
};

export default DashboardContainer;
