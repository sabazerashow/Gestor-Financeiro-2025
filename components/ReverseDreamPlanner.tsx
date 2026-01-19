import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    calculateRequiredMonthlyContribution,
    formatCurrency,
    monthsBetweenDates
} from '@/lib/simulationCalculations';
import { FinancialGoal } from '@/types';

interface ReverseDreamPlannerProps {
    onBack: () => void;
    onCreateGoal?: (goal: Omit<FinancialGoal, 'id' | 'accountId' | 'createdAt'>) => void;
    userMonthlyIncome?: number; // For feasibility check
}

const ReverseDreamPlanner: React.FC<ReverseDreamPlannerProps> = ({
    onBack,
    onCreateGoal,
    userMonthlyIncome
}) => {
    const [targetAmount, setTargetAmount] = useState(80000);
    const [deadline, setDeadline] = useState(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 2);
        return date.toISOString().split('T')[0];
    });
    const [principal, setPrincipal] = useState(0);
    const [interestRate, setInterestRate] = useState(10);

    // Calculate required monthly contribution
    const result = useMemo(() => {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const months = monthsBetweenDates(today, deadlineDate);
        const years = months / 12;

        if (years <= 0) {
            return { monthlyContribution: 0, years: 0, months: 0, isFeasible: false, feasibilityMessage: '' };
        }

        const monthlyContribution = calculateRequiredMonthlyContribution(
            targetAmount,
            years,
            interestRate,
            principal
        );

        // Feasibility check
        let isFeasible = true;
        let feasibilityMessage = '';

        if (userMonthlyIncome && monthlyContribution > 0) {
            const percentageOfIncome = (monthlyContribution / userMonthlyIncome) * 100;

            if (percentageOfIncome > 50) {
                isFeasible = false;
                feasibilityMessage = `⚠️ Isso comprometeria ${percentageOfIncome.toFixed(0)}% da sua renda atual. Sugiro aumentar o prazo ou reduzir o valor da meta.`;
            } else if (percentageOfIncome > 30) {
                feasibilityMessage = `⚡ Isso comprometeria ${percentageOfIncome.toFixed(0)}% da sua renda. É viável, mas exigirá disciplina.`;
            } else {
                feasibilityMessage = `✅ Isso comprometeria apenas ${percentageOfIncome.toFixed(0)}% da sua renda. Meta muito viável!`;
            }
        }

        return {
            monthlyContribution,
            years,
            months,
            isFeasible,
            feasibilityMessage
        };
    }, [targetAmount, deadline, principal, interestRate, userMonthlyIncome]);

    const handleCreateGoal = () => {
        if (onCreateGoal && result.monthlyContribution > 0) {
            onCreateGoal({
                title: 'Meta Personalizada',
                targetAmount,
                currentAmount: principal,
                deadline,
                icon: '🎯',
                color: '#a855f7'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
                    >
                        <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                        <span className="text-sm font-bold uppercase tracking-wider">Voltar</span>
                    </button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl">
                            <i className="fas fa-bullseye text-3xl text-white"></i>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900">Planejador de Sonhos</h1>
                            <p className="text-gray-600 mt-1">Do objetivo ao plano de ação</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white backdrop-blur-xl border border-gray-200 rounded-3xl p-8 mb-6"
                >
                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                        <i className="fas fa-heart text-violet-500"></i>
                        Qual é o seu sonho?
                    </h2>

                    {/* Input: Target Amount */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                            Valor da Meta
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-bold">
                                R$
                            </span>
                            <input
                                type="number"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(Number(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-14 pr-4 py-4 text-3xl font-black text-gray-900 focus:outline-none focus:border-violet-500/50 transition-colors"
                                placeholder="0"
                            />
                        </div>
                        <div className="mt-3 flex gap-2 flex-wrap">
                            {[20000, 50000, 80000, 100000, 200000].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setTargetAmount(amount)}
                                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:text-gray-900 transition-all"
                                >
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input: Deadline */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                            Data Limite
                        </label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-xl font-bold text-gray-900 focus:outline-none focus:border-violet-500/50 transition-colors"
                        />
                        <div className="mt-2 text-sm text-gray-600">
                            {result.years > 0 && (
                                <span>
                                    ⏱️ {result.months} meses ({result.years.toFixed(1)} anos) até a meta
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Input: Principal (Optional) */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                            Já tenho investido (opcional)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">
                                R$
                            </span>
                            <input
                                type="number"
                                value={principal}
                                onChange={(e) => setPrincipal(Number(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-14 pr-4 py-3 text-xl font-bold text-gray-900 focus:outline-none focus:border-violet-500/50 transition-colors"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Scenario Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                            Cenário de Investimento
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setInterestRate(6)}
                                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${interestRate === 6
                                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
                                    }`}
                            >
                                <div>Conservador</div>
                                <div className="text-xs opacity-70">6% a.a. (Poupança/Tesouro)</div>
                            </button>
                            <button
                                onClick={() => setInterestRate(8)}
                                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${interestRate === 8
                                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
                                    }`}
                            >
                                <div>Moderado</div>
                                <div className="text-xs opacity-70">8% a.a. (CDB/LCI)</div>
                            </button>
                            <button
                                onClick={() => setInterestRate(10)}
                                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${interestRate === 10
                                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
                                    }`}
                            >
                                <div>Otimista</div>
                                <div className="text-xs opacity-70">10% a.a. (CDI/Fundos)</div>
                            </button>
                            <button
                                onClick={() => setInterestRate(12)}
                                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${interestRate === 12
                                        ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
                                    }`}
                            >
                                <div>Agressivo</div>
                                <div className="text-xs opacity-70">12% a.a. (Ações/FIIs)</div>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Result Card */}
                {result.monthlyContribution > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-8 mb-6"
                    >
                        <h2 className="text-xl font-black text-violet-400 mb-6 flex items-center gap-3">
                            <i className="fas fa-calculator"></i>
                            Plano de Ação
                        </h2>

                        <div className="mb-6">
                            <div className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-2">
                                Você precisa investir
                            </div>
                            <div className="text-6xl font-black text-white mb-2">
                                {formatCurrency(result.monthlyContribution)}
                            </div>
                            <div className="text-lg text-violet-300">
                                por mês durante {result.years.toFixed(1)} anos
                            </div>
                        </div>

                        {/* Feasibility Alert */}
                        {result.feasibilityMessage && (
                            <div className={`p-4 rounded-2xl ${result.isFeasible
                                ? result.feasibilityMessage.startsWith('✅')
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : 'bg-yellow-500/10 border border-yellow-500/20'
                                : 'bg-red-500/10 border border-red-500/20'
                                }`}>
                                <div className={`text-sm font-bold ${result.isFeasible
                                    ? result.feasibilityMessage.startsWith('✅')
                                        ? 'text-emerald-400'
                                        : 'text-yellow-400'
                                    : 'text-red-400'
                                    }`}>
                                    {result.feasibilityMessage}
                                </div>
                            </div>
                        )}

                        {/* CTA Button */}
                        {onCreateGoal && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreateGoal}
                                className="w-full mt-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black py-4 rounded-2xl shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all flex items-center justify-center gap-3"
                            >
                                <i className="fas fa-bullseye"></i>
                                Transformar em Meta Real
                            </motion.button>
                        )}
                    </motion.div>
                )}

                {/* Info Tip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-sm text-gray-500 flex items-center justify-center gap-2"
                >
                    <i className="fas fa-lightbulb"></i>
                    <span>Dica: Ajuste a data limite para encontrar um valor mensal confortável</span>
                </motion.div>
            </div>
        </div>
    );
};

export default ReverseDreamPlanner;
