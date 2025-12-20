import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../lib/store';
import { categories, expenseCategoryList } from '../categories';
import { TransactionType } from '../types';

interface BudgetManagementProps {
    onAddBudget: () => void;
}

const BudgetManagement: React.FC<BudgetManagementProps> = ({ onAddBudget }) => {
    const { transactions, budgets, accountId } = useFinanceStore();

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const categorySpending = useMemo(() => {
        const spending: Record<string, number> = {};
        transactions
            .filter(t => t.date.startsWith(currentMonth) && t.type === TransactionType.EXPENSE)
            .forEach(t => {
                spending[t.category] = (spending[t.category] || 0) + Number(t.amount);
            });
        return spending;
    }, [transactions, currentMonth]);

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Orçamentos</h2>
                    <p className="text-sm text-gray-400 font-medium">Controle de limites por categoria para {new Date().toLocaleString('pt-BR', { month: 'long' })}</p>
                </div>
                <button
                    onClick={onAddBudget}
                    className="px-6 py-3 bg-[var(--primary)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[var(--primary)]/20 hover:bg-[var(--primary-hover)] transition-all flex items-center gap-3 active:scale-95"
                >
                    <i className="fas fa-plus"></i>
                    Definir Limite
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {budgets.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[var(--radius-lg)] border border-dashed border-gray-200 shadow-sm"
                    >
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-6">
                            <i className="fas fa-piggy-bank text-3xl"></i>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-2">Sem orçamentos definidos</h3>
                        <p className="text-gray-400 text-sm max-w-xs text-center mb-8">Defina limites para suas categorias e receba alertas quando estiver gastando demais.</p>
                        <button
                            onClick={onAddBudget}
                            className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                        >
                            Começar Agora
                        </button>
                    </motion.div>
                ) : (
                    budgets.map((budget, idx) => {
                        const spent = categorySpending[budget.category] || 0;
                        const percentage = Math.min((spent / budget.amount) * 100, 100);
                        const isOver = spent > budget.amount;
                        const categoryInfo = categories[budget.category];

                        return (
                            <motion.div
                                key={budget.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white p-6 rounded-[var(--radius-lg)] border border-gray-100 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all flex flex-col group"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 rounded-2xl ${categoryInfo?.color || 'bg-gray-500'} flex items-center justify-center text-white shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
                                        <i className={`fas ${categoryInfo?.icon || 'fa-tag'} text-xl`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-gray-900 truncate">{budget.category}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Limite: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.amount)}
                                        </p>
                                    </div>
                                    {isOver && (
                                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center animate-bounce">
                                            <i className="fas fa-exclamation-triangle text-xs"></i>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 mt-auto">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gasto Atual</p>
                                            <p className={`text-xl font-black ${isOver ? 'text-red-500' : 'text-gray-900'}`}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className={`text-xl font-black ${isOver ? 'text-red-500' : 'text-[var(--primary)]'}`}>
                                                {Math.round((spent / budget.amount) * 100)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-[var(--primary)]'}`}
                                        ></motion.div>
                                    </div>

                                    <div className={`flex items-center gap-2 p-2 rounded-xl border ${isOver ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                        <i className={`fas ${isOver ? 'fa-arrow-up' : 'fa-check'} text-[10px]`}></i>
                                        <p className="text-[10px] font-black uppercase tracking-[0.05em]">
                                            {isOver
                                                ? `Excedeu em ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent - budget.amount)}`
                                                : `Disponível: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.amount - spent)}`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default BudgetManagement;
