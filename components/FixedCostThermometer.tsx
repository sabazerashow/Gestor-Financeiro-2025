import React from 'react';
import { getTotalFixedCost, getIncomeCommitmentPercentage, getCommitmentMessage } from '../lib/subscriptionHelpers';
import { Bill } from '../types';

interface FixedCostThermometerProps {
    bills: Bill[];
    monthlyIncome?: number;
}

const FixedCostThermometer: React.FC<FixedCostThermometerProps> = ({ bills, monthlyIncome = 5000 }) => {
    const totalFixed = getTotalFixedCost(bills);
    const percentage = getIncomeCommitmentPercentage(totalFixed, monthlyIncome);
    const message = getCommitmentMessage(percentage);

    // Limita a 100% para o display visual
    const displayPercentage = Math.min(percentage, 100);

    // Define a cor do gradiente baseado no percentual
    const getGradientColor = () => {
        if (percentage < 30) return 'from-green-400 to-green-600';
        if (percentage < 50) return 'from-blue-400 to-blue-600';
        if (percentage < 70) return 'from-yellow-400 to-yellow-600';
        return 'from-red-400 to-red-600';
    };

    return (
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <i className="fas fa-thermometer-half"></i>
                </div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Termômetro de Custo Fixo</h2>
            </div>

            {/* Barra de progresso */}
            <div className="relative">
                <div className="w-full h-16 bg-gray-100 rounded-2xl overflow-hidden relative">
                    <div
                        className={`h-full bg-gradient-to-r ${getGradientColor()} transition-all duration-500 ease-out relative`}
                        style={{ width: `${displayPercentage}%` }}
                    >
                        {/* Efeito de brilho */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
                    </div>

                    {/* Percentual dentro da barra */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-black ${displayPercentage > 20 ? 'text-white drop-shadow-lg' : 'text-gray-800'}`}>
                            {percentage.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Marcadores de referência */}
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>0%</span>
                    <span>30%</span>
                    <span>50%</span>
                    <span>70%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Mensagem de impacto */}
            <div className={`mt-6 p-4 rounded-2xl bg-gradient-to-r ${percentage < 30 ? 'from-green-50 to-green-100' :
                    percentage < 50 ? 'from-blue-50 to-blue-100' :
                        percentage < 70 ? 'from-yellow-50 to-yellow-100' :
                            'from-red-50 to-red-100'
                }`}>
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{message.emoji}</span>
                    <div className="flex-1">
                        <p className={`text-lg font-bold ${message.color}`}>
                            {percentage.toFixed(0)}% da sua renda já nasce gasta
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{message.text}</p>
                    </div>
                </div>
            </div>

            {/* Detalhamento */}
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Custo Fixo</p>
                    <p className="text-lg font-bold text-gray-800">R$ {totalFixed.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Renda Mensal</p>
                    <p className="text-lg font-bold text-gray-800">R$ {monthlyIncome.toFixed(2).replace('.', ',')}</p>
                </div>
            </div>
        </div>
    );
};

export default FixedCostThermometer;
