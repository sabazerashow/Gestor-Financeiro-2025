import React, { useMemo } from 'react';
import { Payslip } from '../types';

const MANDATORY_DEDUCTION_PREFIXES = ['PENSAO MILIT', 'FUSMA', 'IMP RENDA'];
const PROMORAR_END_DATE = new Date(2033, 5, 1); // June 2033 (month is 0-indexed)

interface ConsignableMarginCardProps {
  payslip: Payslip | null;
}

const ConsignableMarginCard: React.FC<ConsignableMarginCardProps> = ({ payslip }) => {
    const marginData = useMemo(() => {
        if (!payslip || payslip.grossTotal === 0) return null;

        const totalMargin = payslip.grossTotal * 0.35;

        const usedMargin = payslip.deductions
            .filter(d => !MANDATORY_DEDUCTION_PREFIXES.some(prefix => d.description.toUpperCase().startsWith(prefix)))
            .reduce((sum, d) => sum + d.value, 0);
        
        const percentageUsed = totalMargin > 0 ? (usedMargin / totalMargin) * 100 : 0;
        
        let promorarMonthsLeft: number | null = null;
        if (payslip.deductions.some(d => d.description.toUpperCase().includes('PROMORAR'))) {
            const payslipDate = new Date(payslip.year, payslip.month - 1, 1);
            const diffYear = PROMORAR_END_DATE.getFullYear() - payslipDate.getFullYear();
            const diffMonth = PROMORAR_END_DATE.getMonth() - payslipDate.getMonth();
            promorarMonthsLeft = diffYear * 12 + diffMonth;
        }

        return {
            totalMargin,
            usedMargin,
            availableMargin: totalMargin - usedMargin,
            percentageUsed,
            promorarMonthsLeft,
        };
    }, [payslip]);

    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Saúde Financeira: Margem Consignável</h3>
            {marginData ? (
                <div className="flex-grow flex flex-col justify-between">
                    <div>
                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Uso da Margem (35% do Bruto)</p>
                            <p className="text-4xl font-bold text-indigo-500 mt-1">{marginData.percentageUsed.toFixed(1)}%</p>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative" title={`${marginData.percentageUsed.toFixed(1)}% utilizado`}>
                            <div
                                className="bg-indigo-600 h-4 rounded-full"
                                style={{ width: `${Math.min(marginData.percentageUsed, 100)}%` }}
                            ></div>
                            {marginData.percentageUsed > 100 && (
                                <div 
                                    className="absolute top-0 left-0 h-4 bg-red-500 rounded-full" 
                                    style={{ width: `${Math.min(marginData.percentageUsed, 100)}%` }}
                                ></div>
                            )}
                        </div>
                        
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Utilizado:</span>
                                <span className="font-semibold">{formatCurrency(marginData.usedMargin)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Disponível:</span>
                                <span className={`font-semibold ${marginData.availableMargin >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(marginData.availableMargin)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                                <span className="text-gray-600 dark:text-gray-300 font-bold">Total da Margem:</span>
                                <span className="font-bold">{formatCurrency(marginData.totalMargin)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {marginData.promorarMonthsLeft !== null && marginData.promorarMonthsLeft > 0 && (
                        <div className="mt-6 text-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center">
                                <i className="fas fa-home mr-2 text-indigo-400"></i>
                                Contagem regressiva do PROMORAR:
                            </p>
                            <p className="font-bold text-lg text-indigo-500">{marginData.promorarMonthsLeft} meses restantes</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                     <div className="text-center">
                        <i className="fas fa-percentage text-4xl mb-3"></i>
                        <p>Selecione um mês para ver a análise.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsignableMarginCard;