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
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <i className="fas fa-percentage"></i>
                </div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Saúde Financeira: Margem Consignável</h3>
            </div>
            {marginData ? (
                <div className="flex-grow flex flex-col justify-between">
                    <div>
                        <div className="text-center mb-6">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uso da Margem (35% do Bruto)</p>
                            <p className="text-4xl font-black text-[var(--primary)] mt-1">{marginData.percentageUsed.toFixed(1)}%</p>
                        </div>

                        <div className="w-full bg-[var(--surface)] rounded-full h-4 relative border border-[var(--border)]" title={`${marginData.percentageUsed.toFixed(1)}% utilizado`}>
                            <div
                                className="bg-[var(--primary)] h-4 rounded-full"
                                style={{ width: `${Math.min(marginData.percentageUsed, 100)}%` }}
                            ></div>
                            {marginData.percentageUsed > 100 && (
                                <div
                                    className="absolute top-0 left-0 h-4 bg-expense rounded-full"
                                    style={{ width: `${Math.min(marginData.percentageUsed, 100)}%` }}
                                ></div>
                            )}
                        </div>

                        <div className="mt-6 space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Utilizado:</span>
                                <span className="font-bold text-gray-700">{formatCurrency(marginData.usedMargin)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Disponível:</span>
                                <span className={`font-bold ${marginData.availableMargin >= 0 ? 'text-[var(--income)]' : 'text-[var(--expense)]'}`}>{formatCurrency(marginData.availableMargin)}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-3">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-black">Total da Margem:</span>
                                <span className="font-black text-gray-900">{formatCurrency(marginData.totalMargin)}</span>
                            </div>
                        </div>
                    </div>

                    {marginData.promorarMonthsLeft !== null && marginData.promorarMonthsLeft > 0 && (
                        <div className="mt-6 text-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center">
                                <i className="fas fa-home mr-2 text-[var(--primary)]"></i>
                                PROMORAR: Meses Restantes
                            </p>
                            <p className="font-black text-xl text-[var(--primary)]">{marginData.promorarMonthsLeft} Meses</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-[var(--color-text-muted)]">
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
