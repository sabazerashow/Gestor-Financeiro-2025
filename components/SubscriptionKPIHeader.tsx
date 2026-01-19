import React from 'react';
import { Bill } from '../types';
import { getTotalFixedCost, getIncomeCommitmentPercentage, getNextHighestBill, getDaysUntilDue } from '../lib/subscriptionHelpers';

interface SubscriptionKPIHeaderProps {
    bills: Bill[];
    monthlyIncome?: number; // Renda mensal média
}

const SubscriptionKPIHeader: React.FC<SubscriptionKPIHeaderProps> = ({ bills, monthlyIncome = 5000 }) => {
    const totalFixedCost = getTotalFixedCost(bills);
    const commitmentPercentage = getIncomeCommitmentPercentage(totalFixedCost, monthlyIncome);
    const nextHighestBill = getNextHighestBill(bills);
    const daysUntilNextHighest = nextHighestBill ? getDaysUntilDue(nextHighestBill.dueDay) : null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Card 1: Custo Fixo Total */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <i className="fas fa-wallet text-white text-xl"></i>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Custo Fixo Total</p>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-4xl font-black text-gray-800">
                        R$ {totalFixedCost.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{bills.length} assinatura{bills.length !== 1 ? 's' : ''} ativa{bills.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Card 2: Comprometimento de Renda */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${commitmentPercentage < 50
                            ? 'bg-gradient-to-br from-green-500 to-green-600'
                            : commitmentPercentage < 70
                                ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                                : 'bg-gradient-to-br from-red-500 to-red-600'
                        }`}>
                        <i className="fas fa-chart-pie text-white text-xl"></i>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Comprometimento</p>
                    </div>
                </div>
                <div className="mt-4">
                    <p className={`text-4xl font-black ${commitmentPercentage < 50
                            ? 'text-green-600'
                            : commitmentPercentage < 70
                                ? 'text-yellow-600'
                                : 'text-red-600'
                        }`}>
                        {commitmentPercentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">da sua renda mensal</p>
                </div>
            </div>

            {/* Card 3: Próximo Vencimento Maior */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <i className="fas fa-calendar-exclamation text-white text-xl"></i>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Próximo Grande Vencimento</p>
                    </div>
                </div>
                {nextHighestBill ? (
                    <div className="mt-4">
                        <p className="text-4xl font-black text-gray-800">
                            R$ {(nextHighestBill.amount || 0).toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {nextHighestBill.description} • Em {daysUntilNextHighest} dia{daysUntilNextHighest !== 1 ? 's' : ''}
                        </p>
                    </div>
                ) : (
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-400">Nenhum pendente</p>
                        <p className="text-sm text-gray-500 mt-1">Tudo em dia! 🎉</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionKPIHeader;
