import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../lib/store';
import { FinancialGoal } from '../types';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalToEdit?: FinancialGoal | null;
}

const icons = ['fa-car', 'fa-home', 'fa-plane', 'fa-graduation-cap', 'fa-heartbeat', 'fa-laptop', 'fa-umbrella-beach', 'fa-piggy-bank', 'fa-trophy', 'fa-star'];
const colors = [
    { name: 'Azul', class: 'bg-blue-500', hover: 'hover:ring-blue-500-20' },
    { name: 'Verde', class: 'bg-emerald-500', hover: 'hover:ring-emerald-500-20' },
    { name: 'Roxo', class: 'bg-purple-500', hover: 'hover:ring-purple-500-20' },
    { name: 'Rosa', class: 'bg-pink-500', hover: 'hover:ring-pink-500-20' },
    { name: 'Laranja', class: 'bg-orange-500', hover: 'hover:ring-orange-500-20' },
    { name: 'Indigo', class: 'bg-indigo-500', hover: 'hover:ring-indigo-500-20' },
];

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goalToEdit }) => {
    const { accountId, setGoals } = useFinanceStore();
    const [title, setTitle] = useState(goalToEdit?.title || '');
    const [targetAmount, setTargetAmount] = useState(goalToEdit?.target_amount?.toString() || '');
    const [currentAmount, setCurrentAmount] = useState(goalToEdit?.current_amount?.toString() || '0');
    const [deadline, setDeadline] = useState(goalToEdit?.deadline || '');
    const [icon, setIcon] = useState(goalToEdit?.icon || icons[0]);
    const [color, setColor] = useState(goalToEdit?.color || colors[0].class);

    useEffect(() => {
        if (goalToEdit) {
            setTitle(goalToEdit.title);
            setTargetAmount(goalToEdit.target_amount.toString());
            setCurrentAmount(goalToEdit.current_amount.toString());
            setDeadline(goalToEdit.deadline || '');
            setIcon(goalToEdit.icon || icons[0]);
            setColor(goalToEdit.color || colors[0].class);
        } else {
            setTitle('');
            setTargetAmount('');
            setCurrentAmount('0');
            setDeadline('');
            setIcon(icons[0]);
            setColor(colors[0].class);
        }
    }, [goalToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!accountId || !title || !targetAmount) return;

        const newGoal: FinancialGoal = {
            id: goalToEdit?.id || `goal-${new Date().getTime()}`,
            account_id: accountId,
            title,
            target_amount: parseFloat(targetAmount),
            current_amount: parseFloat(currentAmount),
            deadline: deadline || undefined,
            icon,
            color
        };

        setGoals(prev => {
            if (goalToEdit) {
                return prev.map(g => g.id === goalToEdit.id ? newGoal : g);
            }
            return [...prev, newGoal];
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">
                        {goalToEdit ? 'Editar Meta' : 'Nova Meta Financeira'}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <i className="fas fa-times text-gray-400"></i>
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">O que você quer conquistar?</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Viagem para o Japão"
                                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-medium text-gray-700"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor Alvo (R$)</label>
                                <input
                                    type="number"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-medium text-gray-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quanto já possui? (R$)</label>
                                <input
                                    type="number"
                                    value={currentAmount}
                                    onChange={(e) => setCurrentAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-medium text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data Limite (Opcional)</label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-medium text-gray-700 bg-white"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ícone & Cor</label>
                            <div className="flex flex-wrap gap-2">
                                {icons.map(i => (
                                    <button
                                        key={i}
                                        onClick={() => setIcon(i)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${icon === i ? 'bg-gray-900 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                    >
                                        <i className={`fas ${i}`}></i>
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {colors.map(c => (
                                    <button
                                        key={c.class}
                                        onClick={() => setColor(c.class)}
                                        title={c.name}
                                        className={`w-10 h-10 rounded-xl transition-all ${color === c.class ? 'ring-4 ring-gray-900/10 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'} ${c.class}`}
                                    />
                                ))}
                            </div>
                        </div>
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
                        disabled={!title || !targetAmount}
                        className="flex-1 h-12 rounded-xl font-bold bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        {goalToEdit ? 'Atualizar Meta' : 'Começar Objetivo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalModal;
