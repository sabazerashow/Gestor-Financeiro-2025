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
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md h-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <i className="fas fa-receipt"></i>
                    </div>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">COMPOSIÇÃO DA REMUNERAÇÃO</h2>
                </div>
                <div className="flex items-center justify-center py-10 text-gray-300">
                    <div className="text-center">
                        <i className="fas fa-receipt text-4xl mb-3"></i>
                        <p className="italic">Selecione um contracheque para ver a análise.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md h-full overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <i className="fas fa-receipt"></i>
                </div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">COMPOSIÇÃO DA REMUNERAÇÃO</h2>
            </div>

            <div className="flex flex-col text-center mb-6 space-y-4">
                <div>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatCurrency(compositionData.soldoValue)}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Soldo</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatCurrency(compositionData.adicionaisTotal)}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Adicionais</p>
                </div>
                <div>
                    <div className="h-px w-full bg-gray-50 my-2"></div>
                    <p className="text-3xl font-black text-[var(--primary)] tabular-nums">{formatCurrency(compositionData.grossTotal)}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bruto</p>
                </div>
            </div>

            <div className="border-t border-gray-50 pt-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Composição dos Adicionais</h3>
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
