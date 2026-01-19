import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    calculateCompoundInterest,
    calculateCompoundInterestFinal,
    formatCurrency,
    formatLargeNumber,
    INTEREST_RATE_PRESETS,
    InterestRatePreset
} from '@/lib/simulationCalculations';
import { FinancialGoal } from '@/types';

interface CompoundInterestSimulatorProps {
    onBack: () => void;
    onCreateGoal?: (goal: Omit<FinancialGoal, 'id' | 'accountId' | 'createdAt'>) => void;
}

const CompoundInterestSimulator: React.FC<CompoundInterestSimulatorProps> = ({ onBack, onCreateGoal }) => {
    const [principal, setPrincipal] = useState(1000);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [years, setYears] = useState(10);
    const [annualRate, setAnnualRate] = useState(10);
    const [inflationRate, setInflationRate] = useState(4.5);
    const [useCustomRate, setUseCustomRate] = useState(false);

    // Calculate data for chart
    const chartData = useMemo(() => {
        const data = calculateCompoundInterest(principal, monthlyContribution, annualRate, years);
        // Sample data for performance (show every 3 months if > 3 years)
        const sampleRate = years > 3 ? 3 : 1;
        return data.filter((_, index) => index % sampleRate === 0 || index === data.length - 1);
    }, [principal, monthlyContribution, annualRate, years]);

    // Calculate final results
    const result = useMemo(() => {
        return calculateCompoundInterestFinal(
            principal,
            monthlyContribution,
            annualRate,
            years
        );
    }, [principal, monthlyContribution, annualRate, years]);

    // Calculate present value (adjusted for inflation)
    const presentValue = useMemo(() => {
        const nominalValue = result.finalWealth;
        const inflationMultiplier = Math.pow(1 + inflationRate / 100, years);
        return nominalValue / inflationMultiplier;
    }, [result.finalWealth, inflationRate, years]);

    const handleCreateGoal = () => {
        if (onCreateGoal) {
            const deadline = new Date();
            deadline.setFullYear(deadline.getFullYear() + years);

            onCreateGoal({
                title: 'Investimento em Juros Compostos',
                targetAmount: result.finalWealth,
                currentAmount: principal,
                deadline: deadline.toISOString().split('T')[0],
                icon: '💰',
                color: '#10b981'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-4 group"
                    >
                        <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                        <span className="text-sm font-bold uppercase tracking-wider">Voltar</span>
                    </button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl">
                            <i className="fas fa-chart-line text-3xl text-white"></i>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900">Máquina de Juros Compostos</h1>
                            <p className="text-gray-500 mt-1">O dinheiro do café trabalhando para você</p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content - Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - Controls */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <i className="fas fa-sliders text-emerald-500"></i>
                                Configurações
                            </h2>

                            {/* Principal Input */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                                    Valor Inicial
                                </label>
                                <div className="text-3xl font-black text-gray-900 mb-4">
                                    {formatCurrency(principal)}
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="50000"
                                    step="100"
                                    value={principal}
                                    onChange={(e) => setPrincipal(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
                                    style={{
                                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${(principal / 50000) * 100}%, #e5e7eb ${(principal / 50000) * 100}%, #e5e7eb 100%)`
                                    }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>R$ 0</span>
                                    <span>R$ 50.000</span>
                                </div>
                            </div>

                            {/* Monthly Contribution */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                                    Aporte Mensal
                                </label>
                                <div className="text-3xl font-black text-gray-900 mb-4">
                                    {formatCurrency(monthlyContribution)}
                                </div>
                                <input
                                    type="range"
                                    min="100"
                                    max="10000"
                                    step="50"
                                    value={monthlyContribution}
                                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${((monthlyContribution - 100) / 9900) * 100}%, #e5e7eb ${((monthlyContribution - 100) / 9900) * 100}%, #e5e7eb 100%)`
                                    }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>R$ 100</span>
                                    <span>R$ 10.000</span>
                                </div>
                            </div>

                            {/* Time Period */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                                    Tempo (Anos)
                                </label>
                                <div className="text-3xl font-black text-gray-900 mb-4">
                                    {years} {years === 1 ? 'ano' : 'anos'}
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    step="1"
                                    value={years}
                                    onChange={(e) => setYears(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${((years - 1) / 29) * 100}%, #e5e7eb ${((years - 1) / 29) * 100}%, #e5e7eb 100%)`
                                    }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>1 ano</span>
                                    <span>30 anos</span>
                                </div>
                            </div>

                            {/* Interest Rate Controls */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                                    Taxa de Juros Anual
                                </label>

                                {/* Slider */}
                                <div className="mb-4">
                                    <div className="text-3xl font-black text-gray-900 mb-3">
                                        {annualRate.toFixed(1)}% a.a.
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="20"
                                        step="0.5"
                                        value={annualRate}
                                        onChange={(e) => {
                                            setAnnualRate(Number(e.target.value));
                                            setUseCustomRate(true);
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #10b981 0%, #10b981 ${(annualRate / 20) * 100}%, #e5e7eb ${(annualRate / 20) * 100}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>0%</span>
                                        <span>20%</span>
                                    </div>
                                </div>

                                {/* Presets */}
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Presets</div>
                                <div className="flex gap-2">
                                    {Object.entries(INTEREST_RATE_PRESETS).map(([key, config]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setAnnualRate(config.rate);
                                                setUseCustomRate(false);
                                            }}
                                            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${annualRate === config.rate && !useCustomRate
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
                                                }`}
                                        >
                                            <div className="capitalize">{config.label}</div>
                                            <div className="text-[10px] opacity-70">{config.rate}%</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Inflation Rate */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                                    Inflação Anual
                                </label>

                                {/* Slider */}
                                <div className="mb-4">
                                    <div className="text-2xl font-black text-gray-900 mb-3">
                                        {inflationRate.toFixed(1)}% a.a.
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="15"
                                        step="0.5"
                                        value={inflationRate}
                                        onChange={(e) => setInflationRate(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(inflationRate / 15) * 100}%, #e5e7eb ${(inflationRate / 15) * 100}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>0%</span>
                                        <span>15%</span>
                                    </div>
                                </div>

                                {/* Presets */}
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Presets</div>
                                <div className="flex gap-2">
                                    {[
                                        { label: 'Baixa', value: 3 },
                                        { label: 'Meta BC', value: 4.5 },
                                        { label: 'Média', value: 6 },
                                        { label: 'Alta', value: 10 }
                                    ].map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => setInflationRate(preset.value)}
                                            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${inflationRate === preset.value
                                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300'
                                                }`}
                                        >
                                            <div>{preset.label}</div>
                                            <div className="text-[10px] opacity-70">{preset.value}%</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Panel - Results */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Chart */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <i className="fas fa-chart-area text-emerald-500"></i>
                                Evolução do Patrimônio
                            </h2>

                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#6b7280"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        tickFormatter={(value) => `${Math.floor(value / 12)}a`}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        tickFormatter={(value) => formatLargeNumber(value)}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#10b981' }}
                                        labelFormatter={(value) => `Mês ${value}`}
                                        formatter={(value: any) => formatCurrency(value)}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="invested"
                                        stroke="#9ca3af"
                                        fill="url(#colorInvested)"
                                        strokeWidth={2}
                                        name="Investido"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#10b981"
                                        fill="url(#colorTotal)"
                                        strokeWidth={3}
                                        name="Total"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 gap-4 mb-6">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Total Investido
                                </div>
                                <div className="text-3xl font-black text-gray-900">
                                    {formatCurrency(result.totalInvested)}
                                </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                                <div className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <i className="fas fa-sparkles"></i>
                                    Juros Ganhos
                                </div>
                                <div className="text-3xl font-black text-emerald-600">
                                    {formatCurrency(result.totalInterest)}
                                </div>
                                <div className="text-sm text-emerald-500 mt-1">
                                    Dinheiro que trabalhou para você
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-lg">
                                <div className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">
                                    Patrimônio Final (Nominal)
                                </div>
                                <div className="text-4xl font-black text-white">
                                    {formatCurrency(result.finalWealth)}
                                </div>
                            </div>

                            <div className="bg-white border-2 border-emerald-300 rounded-2xl p-6">
                                <div className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                                    💰 Valor em Poder de Compra Hoje
                                </div>
                                <div className="text-3xl font-black text-gray-900">
                                    {formatCurrency(presentValue)}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    Ajustado pela inflação de {inflationRate}% a.a.
                                </div>
                            </div>
                        </div>
                        {/* CTA Button */}
                        {onCreateGoal && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreateGoal}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 rounded-2xl shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-3"
                            >
                                <i className="fas fa-bullseye"></i>
                                Transformar em Meta
                            </motion.button>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CompoundInterestSimulator;
