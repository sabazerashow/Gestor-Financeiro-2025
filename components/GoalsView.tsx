import React from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../lib/store';
import { FinancialGoal } from '../types';

interface GoalsViewProps {
    onAddGoal: () => void;
    onEditGoal: (goal: FinancialGoal) => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ onAddGoal, onEditGoal }) => {
    const { goals } = useFinanceStore();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Metas Financeiras</h2>
                    <p className="text-sm text-gray-500 font-medium italic">Acompanhe seu progresso para realizar seus sonhos</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAddGoal}
                    className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:opacity-90 transition-all"
                >
                    <i className="fas fa-plus"></i>
                    Nova Meta
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {goals.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-full py-16 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-gray-200"
                    >
                        <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center text-blue-500 mb-6 border border-gray-50">
                            <i className="fas fa-trophy text-4xl"></i>
                        </div>
                        <h3 className="text-xl font-black text-gray-800 mb-2">Qual seu próximo grande objetivo?</h3>
                        <p className="text-gray-500 text-center max-w-xs mb-8 font-medium">Capture seus sonhos, de uma reserva de emergência àquela viagem inesquecível.</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onAddGoal}
                            className="px-8 py-3 bg-[var(--primary)] text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/25"
                        >
                            Começar agora
                        </motion.button>
                    </motion.div>
                ) : (
                    goals.map((goal, index) => {
                        const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                        const isCompleted = goal.current_amount >= goal.target_amount;

                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -8 }}
                                onClick={() => onEditGoal(goal)}
                                className="group relative bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden"
                            >
                                {isCompleted && (
                                    <div className="absolute -top-1 -right-1">
                                        <div className="bg-emerald-500 text-white p-2.5 rounded-bl-[1.5rem] shadow-lg flex items-center gap-1.5 animate-pulse">
                                            <i className="fas fa-check-circle text-xs"></i>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Concluída</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-5 mb-8">
                                    <div className={`w-16 h-16 rounded-[1.25rem] ${goal.color || 'bg-blue-500'} flex items-center justify-center text-white text-2xl shadow-xl shadow-${goal.color?.split('-')[1] || 'blue'}-500/30 group-hover:rotate-6 transition-transform duration-500`}>
                                        <i className={`fas ${goal.icon || 'fa-star'}`}></i>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 text-xl leading-tight mb-1">{goal.title}</h3>
                                        {goal.deadline && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-lg w-fit">
                                                <i className="far fa-calendar-alt text-[10px] text-gray-400"></i>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                                                    {new Date(goal.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Acumulado</p>
                                            <p className="text-2xl font-black text-gray-900 tracking-tighter">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.current_amount)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Meta</p>
                                            <p className="text-sm font-bold text-gray-500">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.target_amount)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden p-1">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1.5, ease: "circOut" }}
                                                className={`h-full rounded-full relative ${isCompleted ? 'bg-emerald-500' : goal.color || 'bg-blue-500'}`}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                            </motion.div>
                                        </div>

                                        <div className="flex justify-between mt-3">
                                            <span className={`text-[11px] font-black uppercase tracking-wider ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {isCompleted ? 'Sonho Realizado!' : `${Math.round(percentage)}% da Meta`}
                                            </span>
                                            {!isCompleted && (
                                                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    falta {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.target_amount - goal.current_amount)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Background glow effect */}
                                <div className={`absolute -bottom-12 -left-12 w-32 h-32 ${goal.color || 'bg-blue-500'} opacity-[0.03] blur-3xl rounded-full group-hover:opacity-10 transition-opacity duration-500`}></div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GoalsView;

