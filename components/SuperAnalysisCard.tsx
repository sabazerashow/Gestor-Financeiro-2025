import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { Transaction, TransactionType } from '../types';
import { colors } from '../lib/designSystem';

interface SuperAnalysisCardProps {
    transactions: Transaction[];
}

type AnalysisMode = 'category' | 'paymentMethod';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const SuperAnalysisCard: React.FC<SuperAnalysisCardProps> = ({ transactions }) => {
    const [mode, setMode] = useState<AnalysisMode>('category');
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Conta transações "A Verificar"
    const unverifiedCount = useMemo(() => {
        return transactions.filter(t =>
            t.category === 'A Verificar' || t.category === 'Outros'
        ).length;
    }, [transactions]);

    // Dados por Categoria
    const categoryData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
        const grouped: Record<string, number> = {};

        expenses.forEach(t => {
            const cat = t.category || 'Outros';
            grouped[cat] = (grouped[cat] || 0) + (Number(t.amount) || 0);
        });

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value: Number(value) || 0 }))
            .filter(i => i.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    // Dados por Método de Pagamento
    const paymentMethodData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
        const grouped: Record<string, number> = {};

        expenses.forEach(t => {
            const method = t.paymentMethod || 'OUTRO';
            // Agrupa em "Crédito" e "À Vista" (débito + dinheiro + pix + outro)
            const category = method === 'CREDITO' ? 'Crédito' : 'À Vista';
            grouped[category] = (grouped[category] || 0) + (Number(t.amount) || 0);
        });

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value: Number(value) || 0 }))
            .filter(i => i.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    const currentData = mode === 'category' ? categoryData : paymentMethodData;
    const total = currentData.reduce((sum, item) => sum + item.value, 0);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 10}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
            </g>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
        >


            {/* Header com Switcher */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Análise</h3>
                            <p className="text-xl font-black text-gray-900 tracking-tight">Raio-X dos Gastos</p>
                        </div>
                        {/* Badge de Alerta Discreto */}
                        {unverifiedCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-2 py-1 rounded-lg flex items-center gap-1.5"
                                style={{
                                    backgroundColor: '#FFF7ED',
                                    border: `1px solid ${colors.warning}`,
                                }}
                            >
                                <span className="text-xs font-bold" style={{ color: colors.warning }}>
                                    {unverifiedCount}
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Mode Switcher */}
                <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button
                        onClick={() => setMode('category')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'category'
                            ? 'bg-white text-[var(--primary)] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Por Categoria
                    </button>
                    <button
                        onClick={() => setMode('paymentMethod')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'paymentMethod'
                            ? 'bg-white text-[var(--primary)] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Crédito vs À Vista
                    </button>
                </div>
            </div>

            {/* Content: Chart + List */}
            {currentData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gráfico de Rosca */}
                    <div className="flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={currentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={5}
                                    dataKey="value"
                                    activeIndex={activeIndex !== null ? activeIndex : undefined}
                                    activeShape={renderActiveShape}
                                    onMouseEnter={(_, index) => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    {currentData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any, name: any) => {
                                        const val = Number(value) || 0;
                                        const pct = total ? ((val / total) * 100).toFixed(1) : '0.0';
                                        return [`${formatCurrency(val)} (${pct}%)`, name];
                                    }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '8px 12px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Valor Total no Centro do Donut */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
                                <p className="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(total)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Lista Top 4 */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-100 pb-2">
                            Top {Math.min(4, currentData.length)} {mode === 'category' ? 'Categorias' : 'Métodos'}
                        </p>
                        {currentData.slice(0, 4).map((item, idx) => {
                            const percentage = total > 0 ? (item.value / total) * 100 : 0;
                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="space-y-1"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                            ></div>
                                            <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-gray-900">{formatCurrency(item.value)}</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                        ></motion.div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500">{percentage.toFixed(1)}% do total</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <p className="text-sm font-bold">Nenhuma despesa registrada ainda</p>
                    <p className="text-xs mt-1">Adicione transações para ver a análise</p>
                </div>
            )}
        </motion.div>
    );
};

export default SuperAnalysisCard;
