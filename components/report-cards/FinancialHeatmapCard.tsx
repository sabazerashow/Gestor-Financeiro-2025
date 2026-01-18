import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Transaction, TransactionType } from '../../types';

interface FinancialHeatmapCardProps {
    transactions: Transaction[];
}

const FinancialHeatmapCard: React.FC<FinancialHeatmapCardProps> = ({ transactions }) => {
    const heatmapData = useMemo(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        // Get first and last day of current month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Calculate expenses per day
        const dailyExpenses: Record<number, number> = {};

        transactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .forEach(t => {
                const date = new Date(t.date + 'T00:00:00');
                if (date.getFullYear() === year && date.getMonth() === month) {
                    const day = date.getDate();
                    dailyExpenses[day] = (dailyExpenses[day] || 0) + Number(t.amount);
                }
            });

        // Calculate percentiles for color coding
        const amounts = Object.values(dailyExpenses).filter(v => v > 0);
        amounts.sort((a, b) => a - b);

        const p50 = amounts.length > 0 ? amounts[Math.floor(amounts.length * 0.5)] : 0;
        const p75 = amounts.length > 0 ? amounts[Math.floor(amounts.length * 0.75)] : 0;

        // Build calendar grid
        const weeks: number[][] = [];
        let currentWeek: number[] = [];

        // Add empty cells for days before month starts
        const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(0); // 0 means empty cell
        }

        // Add all days of month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Add remaining days to complete last week
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(0);
            }
            weeks.push(currentWeek);
        }

        // Count no-spend days
        const noSpendDays = Array.from({ length: today.getDate() }, (_, i) => i + 1)
            .filter(day => !dailyExpenses[day] && day <= today.getDate())
            .length;

        return {
            weeks,
            dailyExpenses,
            p50,
            p75,
            noSpendDays,
            currentDay: today.getDate(),
            monthName: today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        };
    }, [transactions]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const getCellColor = (day: number, amount: number): string => {
        if (day === 0) return 'transparent'; // Empty cell
        if (day > heatmapData.currentDay) return 'bg-gray-50'; // Future days
        if (amount === 0) return 'bg-emerald-100 border-emerald-200'; // No spend - green
        if (amount < heatmapData.p50) return 'bg-yellow-100 border-yellow-200'; // Low - yellow
        if (amount < heatmapData.p75) return 'bg-orange-100 border-orange-200'; // Medium - orange
        return 'bg-red-100 border-red-200'; // High - red
    };

    const getCellTextColor = (day: number, amount: number): string => {
        if (day === 0 || day > heatmapData.currentDay) return 'text-gray-300';
        if (amount === 0) return 'text-emerald-600 font-bold';
        if (amount < heatmapData.p50) return 'text-yellow-700';
        if (amount < heatmapData.p75) return 'text-orange-700';
        return 'text-red-700 font-bold';
    };

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500">
                        <i className="fas fa-calendar-days text-sm"></i>
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Calendário de Calor</h2>
                        <p className="text-sm font-black text-gray-900 tracking-tight capitalize">{heatmapData.monthName}</p>
                    </div>
                </div>
            </div>

            {/* Gamification Stats */}
            <div className="mb-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-emerald-700 font-bold mb-1">
                            <i className="fas fa-trophy mr-1"></i>Dias Sem Gastar
                        </p>
                        <p className="text-2xl font-black text-emerald-600 tracking-tighter tabular-nums">
                            {heatmapData.noSpendDays} dias
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-emerald-600 font-bold leading-relaxed">
                            🎯 Meta: Pinte o<br />calendário de verde!
                        </p>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-grow flex flex-col">
                {/* Week day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-[9px] font-black text-gray-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar cells */}
                <div className="flex-grow flex flex-col gap-2">
                    {heatmapData.weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7 gap-2 flex-1">
                            {week.map((day, dayIndex) => {
                                const amount = heatmapData.dailyExpenses[day] || 0;
                                const isToday = day === heatmapData.currentDay;

                                return (
                                    <motion.div
                                        key={`${weekIndex}-${dayIndex}`}
                                        whileHover={day > 0 && day <= heatmapData.currentDay ? { scale: 1.1, zIndex: 10 } : {}}
                                        className={`
                      relative flex items-center justify-center rounded-lg border transition-all
                      ${getCellColor(day, amount)}
                      ${day > 0 && day <= heatmapData.currentDay ? 'cursor-pointer hover:shadow-md' : ''}
                      ${isToday ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                    `}
                                        title={day > 0 ? `Dia ${day}: ${amount > 0 ? formatCurrency(amount) : 'Sem gastos'}` : ''}
                                    >
                                        {day > 0 && (
                                            <span className={`text-xs ${getCellTextColor(day, amount)}`}>
                                                {day}
                                            </span>
                                        )}
                                        {isToday && (
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-3 text-[9px]">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div>
                    <span className="text-gray-600 font-bold">R$ 0</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
                    <span className="text-gray-600 font-bold">Baixo</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"></div>
                    <span className="text-gray-600 font-bold">Médio</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
                    <span className="text-gray-600 font-bold">Alto</span>
                </div>
            </div>
        </motion.div>
    );
};

export default FinancialHeatmapCard;
