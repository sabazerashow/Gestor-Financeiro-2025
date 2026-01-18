import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, FinancialGoal, Budget } from '../types';
import { generateRuleBasedInsights, calculateMonthEndProjection, FinancialInsight } from '../lib/projectionCalculator';
import { colors as designSystemColors } from '../lib/designSystem';

interface InsightsCarouselProps {
    transactions: Transaction[];
    goals: FinancialGoal[];
    budgets: Budget[];
    currentMonth: string;
    onAnalyzeWithAI?: () => void;
    isAnalyzing?: boolean;
}

const InsightsCarousel: React.FC<InsightsCarouselProps> = ({
    transactions,
    goals,
    budgets,
    currentMonth,
    onAnalyzeWithAI,
    isAnalyzing = false
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const projectedBalance = useMemo(
        () => calculateMonthEndProjection(transactions, [], currentMonth),
        [transactions, currentMonth]
    );

    const insights = useMemo(
        () => generateRuleBasedInsights(transactions, goals, budgets, projectedBalance),
        [transactions, goals, budgets, projectedBalance]
    );

    const colorMap = {
        goal: {
            bg: '#EFF6FF',
            text: designSystemColors.primary,
            border: '#BFDBFE'
        },
        alert: {
            bg: '#FFF7ED',
            text: designSystemColors.warning,
            border: '#FED7AA'
        },
        tip: {
            bg: '#F0FDF4',
            text: designSystemColors.success,
            border: '#BBF7D0'
        }
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
    };

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-100',
                    text: 'text-blue-600',
                    icon: 'bg-blue-100'
                };
            case 'green':
                return {
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-100',
                    text: 'text-emerald-600',
                    icon: 'bg-emerald-100'
                };
            case 'orange':
                return {
                    bg: 'bg-orange-50',
                    border: 'border-orange-100',
                    text: 'text-orange-600',
                    icon: 'bg-orange-100'
                };
            case 'red':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-100',
                    text: 'text-red-600',
                    icon: 'bg-red-100'
                };
            case 'purple':
                return {
                    bg: 'bg-purple-50',
                    border: 'border-purple-100',
                    text: 'text-purple-600',
                    icon: 'bg-purple-100'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-100',
                    text: 'text-gray-600',
                    icon: 'bg-gray-100'
                };
        }
    };

    if (insights.length === 0) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
                <p className="text-sm text-gray-400">Nenhum insight disponível no momento</p>
            </div>
        );
    }

    const currentInsight = insights[currentIndex];
    const colors = getColorClasses(currentInsight.color);

    return (
        <div className="space-y-4">
            {/* Header com botão de AI */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                        <i className="fas fa-lightbulb text-lg"></i>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Insights</h3>
                        <p className="text-lg font-black text-gray-900 tracking-tight">Recomendações Inteligentes</p>
                    </div>
                </div>

                {/* Botão Analisar com IA */}
                {onAnalyzeWithAI && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAnalyzeWithAI}
                        disabled={isAnalyzing}
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                <span>Analisando...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-robot"></i>
                                <span>Analisar com IA</span>
                            </>
                        )}
                    </motion.button>
                )}
            </div>

            {/* Carrossel */}
            <div className="relative">
                <div className="overflow-hidden rounded-3xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.3 }}
                            className={`${colors.bg} border ${colors.border} p-6 md:p-8 rounded-3xl`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-2xl ${colors.icon} flex items-center justify-center text-3xl flex-shrink-0`}>
                                    {currentInsight.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h4 className={`text-lg font-black ${colors.text} tracking-tight`}>
                                            {currentInsight.title}
                                        </h4>
                                        <span className="px-2 py-1 bg-white/60 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            {currentInsight.type === 'goal' && 'Meta'}
                                            {currentInsight.type === 'alert' && 'Alerta'}
                                            {currentInsight.type === 'tip' && 'Dica'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {currentInsight.message}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                {insights.length > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-4">
                        {/* Botão Anterior */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={prevSlide}
                            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
                        >
                            <i className="fas fa-chevron-left text-sm"></i>
                        </motion.button>

                        {/* Indicadores */}
                        <div className="flex items-center gap-2">
                            {insights.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`transition-all ${idx === currentIndex
                                        ? 'w-8 h-2 bg-[var(--primary)] rounded-full'
                                        : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Botão Próximo */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={nextSlide}
                            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
                        >
                            <i className="fas fa-chevron-right text-sm"></i>
                        </motion.button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InsightsCarousel;
