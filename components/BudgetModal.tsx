import React, { useState } from 'react';
import { useFinanceStore } from '../lib/store';
import { expenseCategoryList } from '../categories';
import { Budget } from '../types';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    budgetToEdit?: Budget | null;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, budgetToEdit }) => {
    const { accountId, budgets, setBudgets } = useFinanceStore();
    const [category, setCategory] = useState(budgetToEdit?.category || expenseCategoryList[0]);
    const [amount, setAmount] = useState(budgetToEdit?.amount?.toString() || '');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!accountId || !amount) return;

        const newBudget: Budget = {
            id: budgetToEdit?.id || `budget-${new Date().getTime()}`,
            account_id: accountId,
            category,
            amount: parseFloat(amount),
            period: 'monthly'
        };

        setBudgets(prev => {
            const exists = prev.findIndex(b => b.category === category);
            if (exists > -1) {
                const updated = [...prev];
                updated[exists] = newBudget;
                return updated;
            }
            return [...prev, newBudget];
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Definir Orçamento</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <i className="fas fa-times text-gray-400"></i>
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoria de Despesa</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-medium text-gray-700 bg-white"
                        >
                            {expenseCategoryList.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Limite Mensal (R$)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0,00"
                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-medium text-gray-700"
                        />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start border border-blue-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                            <i className="fas fa-info-circle"></i>
                        </div>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Definir um orçamento ajuda você a monitorar seus gastos e economizar. O app enviará alertas visuais se você ultrapassar esse limite.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!amount}
                        className="flex-1 h-12 rounded-xl font-bold bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        Salvar Limite
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BudgetModal;
