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
        <div className="bg-[var(--card)] p-6 rounded-xl shadow-lg h-full flex flex-col">
            <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Saúde Financeira: Margem Consignável</h3>
            {marginData ? (
                <div className="flex-grow flex flex-col justify-between">
                    <div>
                        <div className="text-center mb-4">
                            <p className="text-sm text-[var(--color-text-muted)]">Uso da Margem (35% do Bruto)</p>
                            <p className="text-4xl font-bold text-[var(--primary)] mt-1">{marginData.percentageUsed.toFixed(1)}%</p>
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
                        
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">Utilizado:</span>
                                <span className="font-semibold">{formatCurrency(marginData.usedMargin)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">Disponível:</span>
                                <span className={`font-semibold ${marginData.availableMargin >= 0 ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>{formatCurrency(marginData.availableMargin)}</span>
                            </div>
                            <div className="flex justify-between border-t border-[var(--border)] pt-2 mt-2">
                                <span className="text-[var(--color-text-muted)] font-bold">Total da Margem:</span>
                                <span className="font-bold">{formatCurrency(marginData.totalMargin)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {marginData.promorarMonthsLeft !== null && marginData.promorarMonthsLeft > 0 && (
                        <div className="mt-6 text-center bg-[var(--surface)] p-3 rounded-lg">
                            <p className="text-sm text-[var(--color-text-muted)] flex items-center justify-center">
                                <i className="fas fa-home mr-2 text-[var(--primary)]"></i>
                                Contagem regressiva do PROMORAR:
                            </p>
                            <p className="font-bold text-lg text-[var(--primary)]">{marginData.promorarMonthsLeft} meses restantes</p>
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
