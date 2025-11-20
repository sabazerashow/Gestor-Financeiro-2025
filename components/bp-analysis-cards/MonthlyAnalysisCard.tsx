import React, { useState, useMemo, useEffect } from 'react';
import { Payslip, Transaction } from '../../types';
import GrossPayCompositionCard from '../GrossPayCompositionCard';
import DeductionsAnalysisCard from '../DeductionsAnalysisCard';
import ConsignableMarginCard from '../ConsignableMarginCard';

interface MonthlyAnalysisCardProps {
  payslips: Payslip[];
  transactions: Transaction[];
}

const MonthlyAnalysisCard: React.FC<MonthlyAnalysisCardProps> = ({ payslips, transactions }) => {
  const availableMonths = useMemo(() => {
    return payslips
        .map(p => `${p.year}-${String(p.month).padStart(2, '0')}`)
        .sort((a, b) => b.localeCompare(a));
  }, [payslips]);

  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const selectedPayslip = useMemo(() => {
    if (!selectedMonth) return null;
    const [year, month] = selectedMonth.split('-').map(Number);
    return payslips.find(p => p.year === year && p.month === month) || null;
  }, [payslips, selectedMonth]);

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-[var(--color-text)]">Análise Mensal Detalhada</h3>
            {availableMonths.length > 0 ? (
              <div className="flex items-center gap-2">
                  <label htmlFor="month-select" className="text-sm font-medium text-[var(--color-text-muted)]">Mês:</label>
                  <select
                      id="month-select"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:text-sm"
                  >
                      {availableMonths.map(monthStr => {
                          const [year, month] = monthStr.split('-');
                          const date = new Date(Number(year), Number(month) - 1);
                          const displayName = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                          return <option key={monthStr} value={monthStr}>{displayName}</option>
                      })}
                  </select>
              </div>
            ) : null}
      </div>

      {selectedPayslip && (
        <div className="mb-8 text-center bg-[var(--surface)] p-4 rounded-lg">
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Salário Líquido Recebido</p>
            <p className="text-3xl sm:text-4xl font-bold text-[var(--primary)]">{selectedPayslip.netTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <GrossPayCompositionCard payslip={selectedPayslip} />
        <DeductionsAnalysisCard payslip={selectedPayslip} />
        <ConsignableMarginCard payslip={selectedPayslip} />
      </div>
    </>
  );
}

export default MonthlyAnalysisCard;
