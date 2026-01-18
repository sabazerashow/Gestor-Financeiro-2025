import React, { useMemo } from 'react';
import { Transaction, Payslip, TransactionType } from '../../types';
import CommittedSpendingChart from './CommittedSpendingChart';

interface CommittedSpendingProps {
    transactions: Transaction[];
    payslips: Payslip[];
    year: number;
}

const CommittedSpending: React.FC<CommittedSpendingProps> = ({ transactions, payslips, year }) => {
    
    const monthlyData = useMemo(() => {
        const dataByMonth: { [month: number]: {
            month: number;
            netSalary: number;
            oneTimeExpenses: number;
            newInstallmentsTotal: number;
        } } = {};

        for (let i = 1; i <= 12; i++) {
            dataByMonth[i] = {
                month: i,
                netSalary: 0,
                oneTimeExpenses: 0,
                newInstallmentsTotal: 0,
            };
        }

        const payslipsForYear = payslips.filter(p => p.year === year);
        payslipsForYear.forEach(p => {
            if (dataByMonth[p.month]) {
                dataByMonth[p.month].netSalary = p.netTotal;
            }
        });

        const transactionsForYear = transactions.filter(t => new Date(t.date + 'T00:00:00').getFullYear() === year);
        transactionsForYear.forEach(t => {
            if (t.type === TransactionType.EXPENSE) {
                const month = new Date(t.date + 'T00:00:00').getMonth() + 1;
                if (t.installmentDetails) {
                    if (t.installmentDetails.current === 1) {
                        dataByMonth[month].newInstallmentsTotal += t.installmentDetails.totalAmount;
                    }
                } else {
                    dataByMonth[month].oneTimeExpenses += t.amount;
                }
            }
        });
        
        return Object.values(dataByMonth).map(d => {
            const totalCommitted = d.oneTimeExpenses + d.newInstallmentsTotal;
            const percentage = d.netSalary > 0 ? (totalCommitted / d.netSalary) * 100 : 0;
            return {
                ...d,
                totalCommitted,
                percentage,
            };
        });
    }, [transactions, payslips, year]);

    const hasData = monthlyData.some(d => d.totalCommitted > 0 || d.netSalary > 0);

    if (!hasData) {
        return (
            <div className="text-center py-8 text-[var(--color-text-muted)]">
                <p>Sem dados suficientes de transações ou salários para gerar a análise de gastos comprometidos para {year}.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-[var(--color-text-muted)]">
                        <thead className="text-xs uppercase bg-[var(--surface)] text-[var(--color-text-muted)]">
                            <tr>
                                <th scope="col" className="px-4 py-2">Mês</th>
                                <th scope="col" className="px-4 py-2 text-right">Sal. Líquido</th>
                                <th scope="col" className="px-4 py-2 text-right">À Vista</th>
                                <th scope="col" className="px-4 py-2 text-right">Parcelado (Novo)</th>
                                <th scope="col" className="px-4 py-2 text-right font-bold">Total Comprometido</th>
                                <th scope="col" className="px-4 py-2 text-right">% do Salário</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyData.map(d => (
                                <tr key={d.month} className="bg-[var(--card)] border-b border-[var(--border)] hover:bg-[var(--surface)]">
                                    <td className="px-4 py-2 font-medium text-[var(--color-text)] whitespace-nowrap">
                                        {new Date(year, d.month - 1).toLocaleString('pt-BR', { month: 'short' })}
                                    </td>
                                    <td className="px-4 py-2 text-right">{d.netSalary > 0 ? d.netSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</td>
                                    <td className="px-4 py-2 text-right">{d.oneTimeExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="px-4 py-2 text-right">{d.newInstallmentsTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="px-4 py-2 text-right font-bold text-[var(--color-text)]">{d.totalCommitted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className={`px-4 py-2 text-right font-semibold ${d.percentage > 50 ? 'text-[var(--destructive)]' : 'text-[var(--success)]'}`}>
                                        {d.netSalary > 0 ? `${d.percentage.toFixed(1)}%` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="min-h-[18rem] md:min-h-[22rem]">
                     <CommittedSpendingChart data={monthlyData} />
                </div>
            </div>
        </div>
    );
};

export default CommittedSpending;
