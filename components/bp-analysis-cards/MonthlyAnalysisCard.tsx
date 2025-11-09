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
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Análise Mensal Detalhada</h3>
            {availableMonths.length > 0 ? (
              <div className="flex items-center gap-2">
                  <label htmlFor="month-select" className="text-sm font-medium text-gray-600 dark:text-gray-300">Mês:</label>
                  <select
                      id="month-select"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
        <div className="mb-8 text-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Salário Líquido Recebido</p>
            <p className="text-4xl font-bold text-indigo-500">{selectedPayslip.netTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
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
