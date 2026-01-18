import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface NetWorthEvolutionCardProps {
    transactions: Transaction[];
}

const NetWorthEvolutionCard: React.FC<NetWorthEvolutionCardProps> = ({ transactions }) => {
    const netWorthData = useMemo(() => {
        // Group transactions by month
        const monthlyData: Record<string, { income: number, expenses: number, pendingInstallments: number }> = {};

        transactions.forEach(t => {
            const month = t.date.substring(0, 7); // YYYY-MM

            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expenses: 0, pendingInstallments: 0 };
            }

            if (t.type === TransactionType.INCOME) {
                monthlyData[month].income += Number(t.amount);
            } else if (t.type === TransactionType.EXPENSE) {
                monthlyData[month].expenses += Number(t.amount);
            }
        });

        // Calculate future installments liabilities per month
        const today = new Date();
        transactions
            .filter(t => t.installmentDetails && new Date(t.date + 'T00:00:00') > today)
            .forEach(t => {
                const month = t.date.substring(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = { income: 0, expenses: 0, pendingInstallments: 0 };
                }
                monthlyData[month].pendingInstallments += Number(t.amount);
            });

        // Sort months and calculate cumulative net worth
        const sortedMonths = Object.keys(monthlyData).sort();

        // Get last 6 months for better visualization
        const last6Months = sortedMonths.slice(-6);

        let cumulativeAssets = 0;
        let cumulativeLiabilities = 0;

        const chartData = last6Months.map(month => {
            const data = monthlyData[month];
            const monthlyBalance = data.income - data.expenses;

            // Assets: cumulative positive balance
            if (monthlyBalance > 0) {
                cumulativeAssets += monthlyBalance;
            }

            // Liabilities: future installments + negative balance
            const monthlyLiabilities = data.pendingInstallments + (monthlyBalance < 0 ? Math.abs(monthlyBalance) : 0);
            cumulativeLiabilities = data.pendingInstallments; // Use current pending, not cumulative

            const netWorth = cumulativeAssets - cumulativeLiabilities;

            return {
                month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
                fullMonth: month,
                assets: cumulativeAssets,
                liabilities: cumulativeLiabilities,
                netWorth,
                monthlyIncome: data.income,
                monthlyExpenses: data.expenses
            };
        });

        // Determine trend and context
        const firstNetWorth = chartData[0]?.netWorth || 0;
        const lastNetWorth = chartData[chartData.length - 1]?.netWorth || 0;
        const isGrowing = lastNetWorth > firstNetWorth;
        const assetsGrowing = chartData[chartData.length - 1]?.assets > chartData[0]?.assets;
        const liabilitiesGrowing = chartData[chartData.length - 1]?.liabilities > chartData[0]?.liabilities;

        let interpretation = '';
        let interpretationIcon = '';
        let interpretationColor = '';

        if (isGrowing) {
            interpretation = 'Construindo patrimônio 📈';
            interpretationIcon = 'fa-arrow-trend-up';
            interpretationColor = 'text-emerald-600';
        } else if (!isGrowing && assetsGrowing) {
            interpretation = 'Imobilizando capital (ex: reformas, investimentos)';
            interpretationIcon = 'fa-building-columns';
            interpretationColor = 'text-blue-600';
        } else if (liabilitiesGrowing) {
            interpretation = 'Alerta: endividamento crescente ⚠️';
            interpretationIcon = 'fa-triangle-exclamation';
            interpretationColor = 'text-red-600';
        } else {
            interpretation = 'Patrimônio estável';
            interpretationIcon = 'fa-minus';
            interpretationColor = 'text-gray-600';
        }

        return {
            chartData,
            currentNetWorth: lastNetWorth,
            currentAssets: chartData[chartData.length - 1]?.assets || 0,
            currentLiabilities: chartData[chartData.length - 1]?.liabilities || 0,
            interpretation,
            interpretationIcon,
            interpretationColor,
            isPositive: lastNetWorth >= 0
        };
    }, [transactions]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-lg">
                    <p className="font-black text-gray-900 text-xs mb-2">{data.month}</p>
                    <div className="space-y-1">
                        <p className="text-[10px] text-emerald-600">
                            <span className="font-bold">Ativos:</span> {formatCurrency(data.assets)}
                        </p>
                        <p className="text-[10px] text-red-600">
                            <span className="font-bold">Passivos:</span> {formatCurrency(data.liabilities)}
                        </p>
                        <p className={`text-[10px] font-black border-t border-gray-100 pt-1 ${data.netWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            Patrimônio: {formatCurrency(data.netWorth)}
                        </p>
                    </div>
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
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-colors duration-500 ${netWorthData.isPositive
                            ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'
                            : 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white'
                        }`}>
                        <i className="fas fa-chart-line text-sm"></i>
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Evolução Patrimonial</h2>
                        <p className="text-sm font-black text-gray-900 tracking-tight">Net Worth</p>
                    </div>
                </div>
            </div>

            {netWorthData.chartData.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-4 border border-gray-50">
                        <i className="fas fa-chart-line text-2xl"></i>
                    </div>
                    <p className="text-sm font-medium text-gray-400 italic">Sem dados suficientes para análise</p>
                    <p className="text-xs text-gray-300 mt-1">Precisamos de histórico de transações</p>
                </div>
            ) : (
                <div className="flex flex-col flex-grow">
                    {/* Current Net Worth */}
                    <div className="mb-6 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100/50">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Patrimônio Líquido</p>
                                <p className={`text-3xl font-black tracking-tighter tabular-nums ${netWorthData.isPositive ? 'text-blue-600' : 'text-red-600'}`}>
                                    {formatCurrency(netWorthData.currentNetWorth)}
                                </p>
                            </div>
                            <div className="text-right text-[10px]">
                                <p className="text-emerald-600 font-bold">
                                    Ativos: {formatCurrency(netWorthData.currentAssets)}
                                </p>
                                <p className="text-red-600 font-bold">
                                    Passivos: {formatCurrency(netWorthData.currentLiabilities)}
                                </p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-blue-100">
                            <p className={`text-xs font-bold flex items-center gap-2 ${netWorthData.interpretationColor}`}>
                                <i className={`fas ${netWorthData.interpretationIcon}`}></i>
                                {netWorthData.interpretation}
                            </p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="flex-grow" style={{ minHeight: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={netWorthData.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={netWorthData.isPositive ? '#3b82f6' : '#ef4444'} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={netWorthData.isPositive ? '#3b82f6' : '#ef4444'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="netWorth"
                                    stroke={netWorthData.isPositive ? '#3b82f6' : '#ef4444'}
                                    strokeWidth={3}
                                    fill="url(#netWorthGradient)"
                                    dot={{ fill: netWorthData.isPositive ? '#3b82f6' : '#ef4444', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
                        <div className="flex items-center justify-center gap-1.5 p-2 bg-emerald-50 rounded-lg">
                            <i className="fas fa-plus-circle text-emerald-500"></i>
                            <span className="text-emerald-700 font-bold">Ativos</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 p-2 bg-red-50 rounded-lg">
                            <i className="fas fa-minus-circle text-red-500"></i>
                            <span className="text-red-700 font-bold">Passivos</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default NetWorthEvolutionCard;
