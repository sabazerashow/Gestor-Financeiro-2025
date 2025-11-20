import React, { useMemo } from 'react';
import { Payslip } from '../types';
import SimplePieChart from './charts/SimplePieChart';

interface GrossPayCompositionCardProps {
  payslip: Payslip | null;
}

const GrossPayCompositionCard: React.FC<GrossPayCompositionCardProps> = ({ payslip }) => {
    const formatCurrency = (value: number) => {
        // Some environments render thin/non-breaking spaces as boxes; sanitize them.
        return value
            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            .replace(/[\u00A0\u202F]/g, ' ');
    };
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

    if (!compositionData) {
        return (
            <div className="bg-[var(--card)] p-6 rounded-xl shadow-sm hover:shadow-md transition-transform hover:-translate-y-0.5 will-change-transform overflow-hidden">
                <h2 className="text-xl font-bold mb-4 text-[var(--color-text)]">Composição da Remuneração</h2>
                <div className="flex items-center justify-center py-10 text-[var(--color-text-muted)]">
                    <div className="text-center">
                        <i className="fas fa-receipt text-4xl mb-3"></i>
                        <p>Selecione um contracheque para ver a análise.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--card)] p-6 rounded-xl shadow-sm hover:shadow-md transition-transform hover:-translate-y-0.5 will-change-transform overflow-hidden">
            <h2 className="text-xl font-bold mb-4 text-[var(--color-text)]">Composição da Remuneração</h2>
            
            <div className="flex flex-col text-center mb-4 space-y-3 overflow-x-hidden">
                <div>
                    <p className="text-xl sm:text-2xl font-bold text-[var(--color-text)] tabular-nums">{formatCurrency(compositionData.soldoValue)}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Soldo</p>
                </div>
                <div>
                    <p className="text-xl sm:text-2xl font-bold text-[var(--color-text)] tabular-nums">{formatCurrency(compositionData.adicionaisTotal)}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Adicionais</p>
                </div>
                <div>
                    <p className="text-xl sm:text-2xl font-bold text-[var(--color-text)] tabular-nums">{formatCurrency(compositionData.grossTotal)}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Total Bruto</p>
                </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
                <h3 className="text-lg font-semibold text-center mb-3 text-[var(--color-text)]">Composição dos Adicionais</h3>
                {compositionData.chartData.values.length > 0 ? (
                    <div className="flex-grow">
                        <SimplePieChart data={compositionData.chartData} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
                         <div className="text-center">
                            <i className="fas fa-pie-chart text-4xl mb-3"></i>
                            <p>Não há valores adicionais neste período.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GrossPayCompositionCard;
