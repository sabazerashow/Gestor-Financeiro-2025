import React, { useState, useMemo, useEffect } from 'react';
import { Payslip, Transaction } from '../../types';
import NetSalaryChart from '../charts/NetSalaryChart';
import CommittedSpending from '../charts/CommittedSpending';
import IncomeVsDeductionsChart from '../charts/IncomeVsDeductionsChart';

interface AnnualAnalysisCardProps {
  payslips: Payslip[];
  transactions: Transaction[];
}

const StatCard: React.FC<{ title: string; value: string; colorClass?: string }> = ({ title, value, colorClass = 'text-[var(--color-text)]' }) => (
    <div className="bg-[var(--surface)] p-3 rounded-lg text-center">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{title}</p>
        <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
    </div>
);


const AnnualAnalysisCard: React.FC<AnnualAnalysisCardProps> = ({ payslips, transactions }) => {
  const availableYears = useMemo(() => {
    const years = new Set(payslips.map(p => p.year));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [payslips]);

  const [selectedYear, setSelectedYear] = useState<number>(() => availableYears[0] || new Date().getFullYear());
  
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);
  
  const filteredPayslips = useMemo(() => {
    return payslips
      .filter(p => p.year === selectedYear)
      .sort((a, b) => a.month - b.month);
  }, [payslips, selectedYear]);

  const yearSummary = useMemo(() => {
    if (filteredPayslips.length === 0) {
      return { totalGross: 0, totalDeductions: 0, averageNet: 0 };
    }
    const totalGross = filteredPayslips.reduce((acc, p) => acc + p.grossTotal, 0);
    const totalDeductions = filteredPayslips.reduce((acc, p) => acc + p.deductionsTotal, 0);
    const totalNet = filteredPayslips.reduce((acc, p) => acc + p.netTotal, 0);
    const averageNet = totalNet / filteredPayslips.length;
    
    return { totalGross, totalDeductions, averageNet };
  }, [filteredPayslips]);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h3 className="text-lg font-bold text-[var(--color-text)]">Análise Anual</h3>
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2">
                <label htmlFor="year-select" className="text-sm font-medium text-[var(--color-text-muted)]">Ano:</label>
                <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:text-sm"
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
          )}
      </div>

      {filteredPayslips.length > 0 ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Bruto" value={formatCurrency(yearSummary.totalGross)} colorClass="text-[var(--income)]" />
            <StatCard title="Total Descontos" value={formatCurrency(yearSummary.totalDeductions)} colorClass="text-[var(--expense)]" />
            <StatCard title="Média Líquida Mensal" value={formatCurrency(yearSummary.averageNet)} colorClass="text-[var(--primary)]" />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-2">
                  <h4 className="text-md font-semibold text-center text-[var(--color-text-muted)] mb-2">Rendimentos vs Descontos (Ano)</h4>
                  <IncomeVsDeductionsChart gross={yearSummary.totalGross} deductions={yearSummary.totalDeductions} />
              </div>
              <div className="lg:col-span-3">
                  <h4 className="text-md font-semibold text-center text-[var(--color-text-muted)] mb-2">Evolução Salário Líquido</h4>
                  <NetSalaryChart payslips={filteredPayslips} />
              </div>
          </div>

          {/* Committed Spending Section */}
          <div>
            <h4 className="text-md font-semibold text-[var(--color-text-muted)] mb-4">Análise de Gastos Comprometidos</h4>
            <CommittedSpending transactions={transactions} payslips={filteredPayslips} year={selectedYear} />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <i className="fas fa-calendar-times text-4xl mb-3"></i>
          <p>Nenhum dado de contracheque encontrado para o ano de {selectedYear}.</p>
        </div>
      )}
    </>
  );
}

export default AnnualAnalysisCard;
