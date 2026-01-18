import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Transaction, TransactionType } from '../../types';
import { categories } from '../../categories';

interface ParetoExpensesCardProps {
    transactions: Transaction[];
}

const ParetoExpensesCard: React.FC<ParetoExpensesCardProps> = ({ transactions }) => {
    const paretoData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);

        // Group by category
        const grouped = expenses.reduce((acc, t) => {
            const cat = t.category || 'Outros';
            acc[cat] = (acc[cat] || 0) + Number(t.amount);
            return acc;
        }, {} as Record<string, number>);

        // Sort by value descending
        const sorted = Object.entries(grouped)
            .map(([name, value]) => ({
                name,
                value: value as number,
                color: categories[name]?.color || '#94a3b8'
            }))
            .sort((a, b) => b.value - a.value);

        // Calculate cumulative percentage
        const totalExpenses = sorted.reduce((sum, item) => sum + item.value, 0);
        let cumulative = 0;

        const paretoChart = sorted.map(item => {
            cumulative += item.value;
            const cumulativePercent = (cumulative / totalExpenses) * 100;

            return {
                name: item.name,
                value: item.value,
                cumulative: parseFloat(cumulativePercent.toFixed(1)),
                color: item.color,
                percentage: parseFloat(((item.value / totalExpenses) * 100).toFixed(1))
            };
        });

        // Find 80% threshold index
        const threshold80Index = paretoChart.findIndex(item => item.cumulative >= 80);

        return {
            chartData: paretoChart,
            threshold80Index,
            totalExpenses,
            criticalCategories: threshold80Index >= 0 ? threshold80Index + 1 : paretoChart.length
        };
    }, [transactions]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-lg">
                    <p className="font-black text-gray-900 text-xs mb-2">{payload[0].payload.name}</p>
                    <p className="text-[10px] text-gray-600">
                        <span className="font-bold">Valor:</span> {formatCurrency(payload[0].value)}
                    </p>
                    <p className="text-[10px] text-gray-600">
                        <span className="font-bold">Participação:</span> {payload[0].payload.percentage}%
                    </p>
                    <p className="text-[10px] text-indigo-600 font-bold">
                        Acumulado: {payload[1]?.value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-500">
                        <i className="fas fa-chart-bar text-sm"></i>
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Análise de Pareto</h2>
                        <p className="text-sm font-black text-gray-900 tracking-tight">Curva ABC dos Gastos</p>
                    </div>
                </div>
            </div>

            {paretoData.chartData.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-4 border border-gray-50">
                        <i className="fas fa-chart-bar text-2xl"></i>
                    </div>
                    <p className="text-sm font-medium text-gray-400 italic">Sem dados de despesas para análise</p>
                </div>
            ) : (
                <div className="flex flex-col flex-grow">
                    {/* Insight */}
                    <div className="mb-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                        <p className="text-xs text-indigo-700 font-bold mb-1">
                            <i className="fas fa-lightbulb mr-1"></i>Princípio 80/20
                        </p>
                        <p className="text-[10px] text-indigo-600 leading-relaxed">
                            {paretoData.threshold80Index >= 0 ? (
                                <>
                                    <span className="font-black">{paretoData.criticalCategories}</span> de {paretoData.chartData.length} categorias ({Math.round((paretoData.criticalCategories / paretoData.chartData.length) * 100)}%) representam <span className="font-black">80%</span> dos seus gastos.
                                    Foque nestas para maior impacto!
                                </>
                            ) : (
                                'Suas despesas estão bem distribuídas entre as categorias.'
                            )}
                        </p>
                    </div>

                    {/* Chart */}
                    <div className="flex-grow" style={{ minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={paretoData.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 10, fill: '#6366f1' }}
                                    tickFormatter={(value) => `${value}%`}
                                    domain={[0, 100]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    yAxisId="left"
                                    dataKey="value"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={50}
                                >
                                    {paretoData.chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index <= paretoData.threshold80Index && paretoData.threshold80Index >= 0 ? entry.color : '#e2e8f0'}
                                            opacity={index <= paretoData.threshold80Index && paretoData.threshold80Index >= 0 ? 1 : 0.4}
                                        />
                                    ))}
                                </Bar>
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="cumulative"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{ fill: '#6366f1', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />

                                {/* 80% reference line */}
                                {paretoData.threshold80Index >= 0 && (
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey={() => 80}
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={false}
                                        legendType="none"
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex items-center justify-center gap-4 text-[10px]">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-indigo-500"></div>
                            <span className="text-gray-600 font-bold">Categorias Críticas</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-gray-200"></div>
                            <span className="text-gray-600 font-bold">Categorias Menores</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-0.5 bg-indigo-500"></div>
                            <span className="text-gray-600 font-bold">% Acumulado</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ParetoExpensesCard;
