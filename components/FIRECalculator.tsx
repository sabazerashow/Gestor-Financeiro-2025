import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    calculateFIRETarget,
    calculateYearsToFIRE,
    calculateFIREProgress,
    formatCurrency
} from '@/lib/simulationCalculations';
import { FinancialGoal } from '@/types';

interface FIRECalculatorProps {
    onBack: () => void;
    onCreateGoal?: (goal: Omit<FinancialGoal, 'id' | 'accountId' | 'createdAt'>) => void;
    currentBalance?: number; // User's current invested assets
}

const FIRECalculator: React.FC<FIRECalculatorProps> = ({
    onBack,
    onCreateGoal,
    currentBalance = 0
}) => {
    const [monthlyExpenses, setMonthlyExpenses] = useState(5000);
    const [currentAssets, setCurrentAssets] = useState(currentBalance);
    const [monthlyContribution, setMonthlyContribution] = useState(1000);
    const [annualRate, setAnnualRate] = useState(10);

    // Calculate FIRE metrics
    const fireMetrics = useMemo(() => {
        const target = calculateFIRETarget(monthlyExpenses);
        const progress = calculateFIREProgress(currentAssets, target);
        const yearsToFire = calculateYearsToFIRE(currentAssets, target, monthlyContribution, annualRate);

        return {
            target,
            progress,
            yearsToFire,
            isAchieved: currentAssets >= target
        };
    }, [monthlyExpenses, currentAssets, monthlyContribution, annualRate]);

    const handleCreateGoal = () => {
        if (onCreateGoal) {
            const deadline = new Date();
            deadline.setFullYear(deadline.getFullYear() + Math.ceil(fireMetrics.yearsToFire));

            onCreateGoal({
                title: 'Independência Financeira (FIRE)',
                targetAmount: fireMetrics.target,
                currentAmount: currentAssets,
                deadline: fireMetrics.isAchieved ? undefined : deadline.toISOString().split('T')[0],
                icon: '🔥',
                color: '#f97316'
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
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-2xl">
                            <i className="fas fa-fire text-3xl text-white"></i>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900">Independência Financeira</h1>
                            <p className="text-gray-600 mt-1">Quando você pode parar de trabalhar?</p>
                        </div>
                    </div>
                </motion.div>

                {/* Input Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white backdrop-blur-xl border border-gray-200 rounded-3xl p-8 mb-6"
                >
                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                        <i className="fas fa-coins text-orange-400"></i>
                        Quanto você precisa para viver?
                    </h2>

                    {/* Monthly Expenses Input */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                            Custo de Vida Mensal Desejado
                        </label>
                        <div className="relative mb-4">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-bold">
                                R$
                            </span>
                            <input
                                type="number"
                                value={monthlyExpenses}
                                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-14 pr-4 py-4 text-3xl font-black text-gray-900 focus:outline-none focus:border-orange-500/50 transition-colors"
                                placeholder="0"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {[3000, 5000, 8000, 10000, 15000].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setMonthlyExpenses(amount)}
                                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:text-gray-900 transition-all"
                                >
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Current Assets */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                            Patrimônio Atual Investido
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">
                                R$
                            </span>
                            <input
                                type="number"
                                value={currentAssets}
                                onChange={(e) => setCurrentAssets(Number(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-14 pr-4 py-3 text-xl font-bold text-gray-900 focus:outline-none focus:border-orange-500/50 transition-colors"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Monthly Contribution */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                            Aporte Mensal
                        </label>
                        <div className="text-2xl font-black text-gray-900 mb-4">
                            {formatCurrency(monthlyContribution)}
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={monthlyContribution}
                            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #f97316 0%, #f97316 ${(monthlyContribution / 10000) * 100}%, #e5e7eb ${(monthlyContribution / 10000) * 100}%, #e5e7eb 100%)`
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>R$ 0</span>
                            <span>R$ 10.000</span>
                        </div>
                    </div>

                    {/* Expected Return */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                            Retorno Anual Esperado
                        </label>
                        <div className="flex gap-2">
                            {[6, 8, 10, 12].map((rate) => (
                                <button
                                    key={rate}
                                    onClick={() => setAnnualRate(rate)}
                                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${annualRate === rate
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                                        }`}
                                >
                                    {rate}% a.a.
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Result Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-orange-50 border border-orange-200 rounded-3xl p-8 mb-6"
                >
                    <h2 className="text-xl font-black text-orange-600 mb-8 flex items-center gap-3">
                        <i className="fas fa-chart-line"></i>
                        Resultado (Regra dos 4%)
                    </h2>

                    {/* FIRE Target */}
                    <div className="mb-8">
                        <div className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">
                            Patrimônio Necessário para FIRE
                        </div>
                        <div className="text-6xl font-black text-gray-900 mb-2">
                            {formatCurrency(fireMetrics.target)}
                        </div>
                        <div className="text-sm text-gray-600">
                            Com esse valor, você pode viver de renda passiva indefinidamente
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <div className="text-sm font-bold text-orange-600 uppercase tracking-wider">
                                Seu Progresso Atual
                            </div>
                            <div className="text-2xl font-black text-gray-900">
                                {fireMetrics.progress}%
                            </div>
                        </div>
                        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${fireMetrics.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-end pr-2"
                            >
                                {fireMetrics.progress > 5 && (
                                    <i className="fas fa-fire text-white text-xs"></i>
                                )}
                            </motion.div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            Você já conquistou {formatCurrency(currentAssets)} de {formatCurrency(fireMetrics.target)}
                        </div>
                    </div>

                    {/* Years to FIRE */}
                    {!fireMetrics.isAchieved && (
                        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-2xl">
                            <div className="text-center">
                                {fireMetrics.yearsToFire === Infinity ? (
                                    <>
                                        <div className="text-4xl font-black text-gray-900 mb-2">∞</div>
                                        <div className="text-sm text-gray-600">
                                            ⚠️ Com o aporte atual, não é possível atingir a meta. Aumente o aporte mensal.
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">
                                            Faltam
                                        </div>
                                        <div className="text-5xl font-black text-gray-900 mb-2">
                                            {fireMetrics.yearsToFire.toFixed(1)} anos
                                        </div>
                                        <div className="text-lg text-gray-700">
                                            para sua liberdade financeira
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Achievement Message */}
                    {fireMetrics.isAchieved && (
                        <div className="mb-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                            <div className="text-center">
                                <i className="fas fa-trophy text-5xl text-emerald-400 mb-4"></i>
                                <div className="text-2xl font-black text-emerald-600 mb-2">
                                    🎉 Parabéns! Você já atingiu FIRE!
                                </div>
                                <div className="text-sm text-emerald-600">
                                    Você tem patrimônio suficiente para viver de renda passiva
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA Button */}
                    {onCreateGoal && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCreateGoal}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black py-4 rounded-2xl shadow-2xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-3"
                        >
                            <i className="fas fa-fire"></i>
                            {fireMetrics.isAchieved ? 'Registrar Conquista FIRE' : 'Criar Meta de Independência'}
                        </motion.button>
                    )}
                </motion.div>

                {/* Info Box */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6"
                >
                    <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                        <i className="fas fa-info-circle text-orange-400"></i>
                        Sobre a Regra dos 4%
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        A "Regra dos 4%" sugere que você pode sacar 4% do seu patrimônio anualmente sem esgotar seus recursos.
                        Isso significa que você precisa de <strong className="text-gray-900">25 vezes</strong> suas despesas anuais investidas
                        para atingir a independência financeira.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default FIRECalculator;
