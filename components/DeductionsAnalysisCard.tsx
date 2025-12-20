import React, { useMemo } from 'react';
import { Payslip } from '../types';
import SimplePieChart from './charts/SimplePieChart';

interface DeductionsAnalysisCardProps {
    payslip: Payslip | null;
}

const DeductionsAnalysisCard: React.FC<DeductionsAnalysisCardProps> = ({ payslip }) => {
    const chartData = useMemo(() => {
        if (!payslip) return null;
        return {
            labels: payslip.deductions.map(d => d.description),
            values: payslip.deductions.map(d => d.value),
        };
    }, [payslip]);

    return (
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <i className="fas fa-chart-pie"></i>
                </div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Análise dos Descontos</h3>
            </div>
            {chartData && payslip ? (
                <div className="flex-grow flex flex-col">
                    <div className="text-center mb-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total de Descontos no Mês</p>
                        <p className="text-3xl font-black text-[var(--expense)]">{payslip.deductionsTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <div className="flex-grow">
                        <SimplePieChart data={chartData} />
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                    <div className="text-center">
                        <i className="fas fa-chart-pie text-4xl mb-3"></i>
                        <p>Selecione um mês para ver a análise.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeductionsAnalysisCard;
