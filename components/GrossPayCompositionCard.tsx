import React, { useMemo } from 'react';
import { Payslip } from '../types';
import SimplePieChart from './charts/SimplePieChart';

interface GrossPayCompositionCardProps {
  payslip: Payslip | null;
}

const GrossPayCompositionCard: React.FC<GrossPayCompositionCardProps> = ({ payslip }) => {
    const compositionData = useMemo(() => {
        if (!payslip) return null;

        const soldoItem = payslip.payments.find(p => p.description.toUpperCase() === 'SOLDO');
        const soldoValue = soldoItem ? soldoItem.value : 0;
        
        const adicionais = payslip.payments.filter(p => p.description.toUpperCase() !== 'SOLDO');
        const adicionaisTotal = adicionais.reduce((sum, item) => sum + item.value, 0);

        const chartData = {
            labels: adicionais.map(p => p.description),
            values: adicionais.map(p => p.value),
        };

        return {
            soldoValue,
            adicionaisTotal,
            grossTotal: payslip.grossTotal,
            chartData
        };
    }, [payslip]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Composição da Remuneração</h3>
            {compositionData && payslip ? (
                <div className="flex-grow flex flex-col">
                    <div className="grid grid-cols-3 gap-2 text-center mb-4 border-b dark:border-gray-700 pb-4">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Soldo</p>
                            <p className="font-bold text-gray-700 dark:text-gray-300">{compositionData.soldoValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Adicionais</p>
                            <p className="font-bold text-gray-700 dark:text-gray-300">{compositionData.adicionaisTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                         <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Bruto</p>
                            <p className="font-bold text-green-500">{compositionData.grossTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                    
                    <div className="flex-grow flex flex-col">
                        <p className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Composição dos Adicionais</p>
                        <div className="flex-grow">
                            <SimplePieChart data={compositionData.chartData} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                     <div className="text-center">
                        <i className="fas fa-pie-chart text-4xl mb-3"></i>
                        <p>Selecione um mês para ver a análise.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GrossPayCompositionCard;