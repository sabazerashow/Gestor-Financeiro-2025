import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Transaction, TransactionType } from '../../types';

interface SubscriptionDetectorCardProps {
    transactions: Transaction[];
}

interface DetectedSubscription {
    description: string;
    monthlyAmount: number;
    occurrences: number;
    monthsDetected: string[];
}

const SubscriptionDetectorCard: React.FC<SubscriptionDetectorCardProps> = ({ transactions }) => {
    const subscriptionData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);

        // Group by description and similar amount (±5% variation)
        const grouped: Record<string, { amounts: number[], months: Set<string> }> = {};

        expenses.forEach(t => {
            const desc = t.description.toLowerCase().trim();
            const amount = Number(t.amount);
            const month = t.date.substring(0, 7); // YYYY-MM

            // Check if similar description already exists
            let matchedKey: string | null = null;
            for (const key in grouped) {
                if (key === desc) {
                    matchedKey = key;
                    break;
                }
            }

            if (!matchedKey) {
                grouped[desc] = { amounts: [amount], months: new Set([month]) };
            } else {
                grouped[matchedKey].amounts.push(amount);
                grouped[matchedKey].months.add(month);
            }
        });

        // Detect subscriptions: 3+ occurrences in different months with similar amounts
        const subscriptions: DetectedSubscription[] = [];

        for (const [desc, data] of Object.entries(grouped)) {
            if (data.months.size >= 3) {
                // Check if amounts are similar (±5% variation)
                const avgAmount = data.amounts.reduce((sum, a) => sum + a, 0) / data.amounts.length;
                const allSimilar = data.amounts.every(a =>
                    Math.abs(a - avgAmount) <= avgAmount * 0.05
                );

                if (allSimilar) {
                    subscriptions.push({
                        description: desc.charAt(0).toUpperCase() + desc.slice(1),
                        monthlyAmount: avgAmount,
                        occurrences: data.amounts.length,
                        monthsDetected: Array.from(data.months).sort()
                    });
                }
            }
        }

        subscriptions.sort((a, b) => b.monthlyAmount - a.monthlyAmount);

        const totalMonthly = subscriptions.reduce((sum, s) => sum + s.monthlyAmount, 0);
        const annualImpact = totalMonthly * 12;

        return {
            subscriptions,
            totalMonthly,
            annualImpact,
            count: subscriptions.length
        };
    }, [transactions]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Icon mapping for common subscriptions
    const getIcon = (description: string): string => {
        const desc = description.toLowerCase();
        if (desc.includes('netflix')) return 'fa-brands fa-netflix';
        if (desc.includes('spotify')) return 'fa-brands fa-spotify';
        if (desc.includes('amazon') || desc.includes('prime')) return 'fa-brands fa-amazon';
        if (desc.includes('youtube')) return 'fa-brands fa-youtube';
        if (desc.includes('apple')) return 'fa-brands fa-apple';
        if (desc.includes('google')) return 'fa-brands fa-google';
        if (desc.includes('microsoft')) return 'fa-brands fa-microsoft';
        if (desc.includes('academia') || desc.includes('gym')) return 'fa-dumbbell';
        if (desc.includes('internet') || desc.includes('wifi')) return 'fa-wifi';
        if (desc.includes('celular') || desc.includes('telefone')) return 'fa-mobile-alt';
        return 'fa-repeat';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shadow-inner group-hover:bg-purple-500 group-hover:text-white transition-colors duration-500">
                        <i className="fas fa-ghost text-sm"></i>
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Detector de Gastos</h2>
                        <p className="text-sm font-black text-gray-900 tracking-tight">Assinaturas Zumbis</p>
                    </div>
                </div>
            </div>

            {subscriptionData.count === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-4 border border-gray-50">
                        <i className="fas fa-search text-2xl"></i>
                    </div>
                    <p className="text-sm font-medium text-gray-400 italic">Nenhuma assinatura recorrente detectada</p>
                    <p className="text-xs text-gray-300 mt-1">Precisamos de 3+ meses de histórico</p>
                </div>
            ) : (
                <div className="flex flex-col flex-grow">
                    {/* Summary */}
                    <div className="mb-6 p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Impacto Mensal</p>
                                <p className="text-2xl font-black text-purple-600 tracking-tighter tabular-nums">
                                    {formatCurrency(subscriptionData.totalMonthly)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Impacto Anual</p>
                                <p className="text-xl font-black text-purple-500 tracking-tighter tabular-nums">
                                    {formatCurrency(subscriptionData.annualImpact)}
                                </p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-purple-100">
                            <p className="text-xs text-purple-600 font-bold text-center">
                                💡 Isso equivale a quase um 14º salário. Você usa todas elas?
                            </p>
                        </div>
                    </div>

                    {/* List */}
                    <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">
                        <i className="fas fa-list mr-1"></i>{subscriptionData.count} Assinatura{subscriptionData.count > 1 ? 's' : ''} Detectada{subscriptionData.count > 1 ? 's' : ''}
                    </h3>
                    <ul className="space-y-2 list-none m-0 p-0 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        {subscriptionData.subscriptions.map((sub, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-50 hover:border-purple-100 hover:bg-purple-50/10 transition-all group/item"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0 group-hover/item:bg-purple-100 transition-colors">
                                        <i className={`${getIcon(sub.description)} text-xs`}></i>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-black text-gray-800 truncate text-xs group-hover/item:text-purple-600 transition-colors" title={sub.description}>
                                            {sub.description}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 tracking-tighter">
                                            {sub.occurrences}x detectado • {sub.monthsDetected.length} meses
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right whitespace-nowrap font-black text-purple-600 text-sm tabular-nums ml-3">
                                    {formatCurrency(sub.monthlyAmount)}
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            )}
        </motion.div>
    );
};

export default SubscriptionDetectorCard;
