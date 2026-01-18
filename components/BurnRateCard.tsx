import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Transaction, Bill } from '../types';
import { calculateCurrentBalance, calculateMonthEndProjection, calculateBurnRateChartData } from '../lib/projectionCalculator';

interface BurnRateCardProps {
    transactions: Transaction[];
    bills: Bill[];
    currentMonth: string;
}

const BurnRateCard: React.FC<BurnRateCardProps> = ({ transactions, bills, currentMonth }) => {
    const currentBalance = useMemo(() => calculateCurrentBalance(transactions), [transactions]);

    const projectedBalance = useMemo(
        () => calculateMonthEndProjection(transactions, bills, currentMonth),
        [transactions, bills, currentMonth]
    );

    const chartData = useMemo(
        () => calculateBurnRateChartData(transactions, currentMonth),
        [transactions, currentMonth]
    );

    // Calculate dynamic Y-axis domain
    const yAxisDomain = useMemo(() => {
        const allValues = chartData.flatMap(d => [d.income, d.expense]);
        const maxValue = Math.max(...allValues, 0);
        const minValue = Math.min(...allValues, 0);
        // Add 10% padding to make lines visible
        const padding = (maxValue - minValue) * 0.1;
        return [Math.floor(minValue - padding), Math.ceil(maxValue + padding)];
    }, [chartData]);

    const today = new Date().getDate();
    const balanceColor = currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600';
    const projectionColor = projectedBalance >= 0 ? 'text-emerald-500' : 'text-red-500';

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
        >
            {/* Header Simplificado */}
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div>
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Fluxo de Caixa</h2>
                    <p className="text-xl font-black text-gray-900 tracking-tight">Evolução Mensal</p>
                </div>
            </div>

            {/* Chart - Altura aumentada */}
            <div className="h-96 md:h-[400px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />

                        <XAxis
                            dataKey="day"
                            stroke="#9ca3af"
                            tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb' }}
                        />

                        <YAxis
                            stroke="#9ca3af"
                            tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb' }}
                            domain={yAxisDomain}
                            tickFormatter={(value) =>
                                new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(value)
                            }
                        />

                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}
                            formatter={(value: any) => [formatCurrency(Number(value)), '']}
                            labelFormatter={(label) => `Dia ${label}`}
                        />

                        {/* Linha de referência para o dia atual */}
                        <ReferenceLine
                            x={today}
                            stroke="#6366f1"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{
                                value: 'Hoje',
                                position: 'top',
                                fill: '#6366f1',
                                fontSize: 10,
                                fontWeight: 'bold'
                            }}
                        />

                        {/* Área de Entradas */}
                        <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#10b981"
                            strokeWidth={3}
                            fill="url(#incomeGradient)"
                            name="Entradas"
                            strokeDasharray={(point: any) => point.day > today ? '5 5' : undefined}
                        />

                        {/* Área de Saídas */}
                        <Area
                            type="monotone"
                            dataKey="expense"
                            stroke="#ef4444"
                            strokeWidth={3}
                            fill="url(#expenseGradient)"
                            name="Saídas"
                            strokeDasharray={(point: any) => point.day > today ? '5 5' : undefined}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-gray-600">Entradas</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs font-bold text-gray-600">Saídas</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-px bg-gray-400" style={{ width: '20px', borderTop: '2px dashed' }}></div>
                    <span className="text-xs font-bold text-gray-600">Previsão</span>
                </div>
            </div>
        </motion.div>
    );
};

export default BurnRateCard;
