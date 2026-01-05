

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, CategoryExpense, CategoryIncome, PaymentMethod, TransactionType } from '../types';
import { categories } from '../categories';
import PeriodSummaryCard from './PeriodSummaryCard';
import SpendingByCategoryCard from './report-cards/SpendingByCategoryCard';
import PendingInstallmentsCard from './report-cards/PendingInstallmentsCard';
import IntelligentAnalysisCards from './IntelligentAnalysisCards';

interface ReportsViewProps {
  transactions: Transaction[];
}

const ReportsView: React.FC<ReportsViewProps> = ({
  transactions = []
}) => {
  const [periodType, setPeriodType] = useState<'month' | 'period'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const analysisTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date + 'T00:00:00');
      if (periodType === 'month') {
        const [year, month] = selectedMonth.split('-').map(Number);
        if (typeof month !== 'number' || isNaN(month)) {
          return false;
        }
        return transactionDate.getFullYear() === year && transactionDate.getMonth() === month - 1;
      } else {
        const startDate = new Date(dateRange.start + 'T00:00:00');
        const endDate = new Date(dateRange.end + 'T00:00:00');
        return transactionDate >= startDate && transactionDate <= endDate;
      }
    });
  }, [transactions, periodType, selectedMonth, dateRange]);

  const CreditCardFooter = () => {
    const invoiceTotal = useMemo(() => {
      return analysisTransactions
        .filter(t => t.paymentMethod === PaymentMethod.CREDITO)
        .reduce((acc, t) => acc + Number(t.amount), 0);
    }, [analysisTransactions]);

    if (invoiceTotal === 0) return null;

    const [year, month] = selectedMonth.split('-').map(Number);
    const dueDate = new Date(year, month, 10); // Assume due date is 10th of next month
    const invoiceMonth = new Date(year, month - 1, 1).toLocaleString('pt-BR', { month: 'short', year: 'numeric' });

    return (
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
        <i className="fas fa-info-circle text-blue-500"></i>
        <span>Fatura {invoiceMonth} (Vence {dueDate.toLocaleDateString('pt-BR')}):</span>
        <span className="text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoiceTotal)}</span>
      </div>
    );
  };


  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Relatórios Detalhados</h2>
          <p className="text-sm text-gray-500 font-medium">Análise profunda da sua saúde financeira mensal</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100">
          <div className="flex p-1 bg-gray-50 rounded-xl">
            <button
              onClick={() => setPeriodType('month')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${periodType === 'month' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setPeriodType('period')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${periodType === 'period' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Período
            </button>
          </div>

          <div className="hidden sm:block h-8 w-px bg-gray-100"></div>

          <AnimatePresence mode="wait">
            {periodType === 'month' ? (
              <motion.div
                key="month-picker"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex justify-center sm:justify-start"
              >
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 p-2 sm:p-0 cursor-pointer text-center sm:text-left"
                />
              </motion.div>
            ) : (
              <motion.div
                key="period-picker"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col xs:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 px-2 sm:px-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">De</span>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="bg-gray-50/50 border border-gray-100 rounded-lg text-[10px] sm:text-xs font-bold text-gray-700 p-1.5 focus:ring-0 w-28 sm:w-24"
                  />
                </div>
                <span className="text-gray-300 font-bold hidden xs:inline">→</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Até</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="bg-gray-50/50 border border-gray-100 rounded-lg text-[10px] sm:text-xs font-bold text-gray-700 p-1.5 focus:ring-0 w-28 sm:w-24"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-6 gap-8"
      >
        {/* Row 1: Period Summary (Full Width) */}
        <div className="lg:col-span-6">
          <PeriodSummaryCard transactions={analysisTransactions} />
        </div>

        {/* Row 2: Income and Expenses (50/50) */}
        <div className="lg:col-span-3">
          <SpendingByCategoryCard
            transactions={analysisTransactions.filter(t => t.type === 'income')}
            paymentMethods={[PaymentMethod.PIX, PaymentMethod.DINHEIRO, PaymentMethod.OUTRO]}
            title="Distribuição de Receitas"
            icon="fa-chart-line"
          />
        </div>
        <div className="lg:col-span-3">
          <SpendingByCategoryCard
            transactions={analysisTransactions.filter(t => t.type === TransactionType.EXPENSE)}
            paymentMethods={[PaymentMethod.CREDITO, PaymentMethod.DEBITO, PaymentMethod.PIX, PaymentMethod.DINHEIRO, PaymentMethod.OUTRO]}
            title="Distribuição de Despesas"
            icon="fa-chart-pie"
          />
        </div>

        {/* Row 3: Credit and Debit (1/2 each) */}
        <div className="lg:col-span-3">
          <SpendingByCategoryCard
            transactions={analysisTransactions.filter(t => t.type === TransactionType.EXPENSE)}
            paymentMethods={[PaymentMethod.CREDITO]}
            title="Movimentação: Crédito"
            icon="fa-regular fa-credit-card"
            footer={<CreditCardFooter />}
          />
        </div>
        <div className="lg:col-span-3">
          <SpendingByCategoryCard
            transactions={analysisTransactions.filter(t => t.type === TransactionType.EXPENSE)}
            paymentMethods={[PaymentMethod.DEBITO, PaymentMethod.PIX, PaymentMethod.DINHEIRO, PaymentMethod.OUTRO]}
            title="Movimentação: Débito & Outros"
            icon="fa-money-bill-wave"
          />
        </div>

        {/* Row 4: Pending and AI (1/2 each) */}
        <div className="lg:col-span-3">
          <PendingInstallmentsCard allTransactions={transactions} />
        </div>
        <div className="lg:col-span-3">
          <IntelligentAnalysisCards transactions={analysisTransactions} />
        </div>
      </motion.div>
    </div>
  );
};

export default ReportsView;

