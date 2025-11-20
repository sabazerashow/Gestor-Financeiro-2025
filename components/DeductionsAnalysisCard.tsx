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
        <div className="bg-[var(--card)] p-6 rounded-xl shadow-lg h-full flex flex-col">
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Análise dos Descontos</h3>
            {chartData && payslip ? (
                <div className="flex-grow flex flex-col">
                     <div className="text-center">
                        <p className="text-sm text-[var(--color-text-muted)]">Total de Descontos no Mês</p>
                        <p className="text-3xl font-bold text-[var(--destructive)] mb-4">{payslip.deductionsTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
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
