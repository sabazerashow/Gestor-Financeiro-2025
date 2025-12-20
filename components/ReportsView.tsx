

import React, { useState, useMemo } from 'react';
import { Transaction, CategoryExpense, CategoryIncome, PaymentMethod } from '../types';
import { categories } from '../categories';
import PeriodSummaryCard from './PeriodSummaryCard';
import SpendingByCategoryCard from './report-cards/SpendingByCategoryCard';
import PendingInstallmentsCard from './report-cards/PendingInstallmentsCard';
import IntelligentAnalysisCards from './IntelligentAnalysisCards';

interface ReportsViewProps {
  transactions: Transaction[];
}

const ReportsView: React.FC<ReportsViewProps> = ({
  transactions
}) => {
  const [periodType, setPeriodType] = useState<'month' | 'period'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [isManageCardsModalOpen, setIsManageCardsModalOpen] = useState(false);

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

  const expenseData: CategoryExpense[] = useMemo(() => {
    const expenses = analysisTransactions.filter(t => t.type === 'expense');
    // FIX: Ensure 't.amount' is treated as a number in reduce functions.
    const totalExpense = expenses.reduce((acc: number, t) => acc + (Number(t.amount) || 0), 0);
    if (totalExpense === 0) return [];

    const byCategory = expenses.reduce((acc: { [key: string]: number }, t) => {
      const cat = t.category || 'Outros';
      // FIX: Ensure 't.amount' is treated as a number in reduce functions.
      acc[cat] = (acc[cat] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

    const palette = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
    return Object.entries(byCategory)
      .map(([category, amount], idx) => ({
        category,
        amount: amount as number,
        percentage: ((amount as number) / totalExpense) * 100,
        color: palette[idx % palette.length],
        icon: categories[category]?.icon || 'fa-tag',
      }))
      .sort((a, b) => (b.amount as number) - (a.amount as number));
  }, [analysisTransactions]);

  const incomeData: CategoryIncome[] = useMemo(() => {
    const incomes = analysisTransactions.filter(t => t.type === 'income');
    // FIX: Ensure 't.amount' is treated as a number in reduce functions.
    const totalIncome = incomes.reduce((acc: number, t) => acc + (Number(t.amount) || 0), 0);
    if (totalIncome === 0) return [];

    const byCategory = incomes.reduce((acc: { [key: string]: number }, t) => {
      const cat = t.category || 'Outros';
      // FIX: Ensure 't.amount' is treated as a number in reduce functions.
      acc[cat] = (acc[cat] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

    const palette = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
    return Object.entries(byCategory)
      .map(([category, amount], idx) => ({
        category,
        amount: amount as number,
        percentage: ((amount as number) / totalIncome) * 100,
        color: palette[idx % palette.length],
        icon: categories[category]?.icon || 'fa-tag',
      }))
      .sort((a, b) => (b.amount as number) - (a.amount as number));
  }, [analysisTransactions]);

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
      <p className="text-xs text-center text-[var(--color-text-muted)] mt-2">
        Fatura {invoiceMonth}: <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoiceTotal)}</span>, vence em {dueDate.toLocaleDateString('pt-BR')}
      </p>
    );
  };


  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-4 p-4 bg-[var(--card)] rounded-lg shadow">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPeriodType('month')}
              className={`px-3 py-1 text-sm rounded-md ${periodType === 'month' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-[var(--surface)]'}`}
            >
              Mês
            </button>
            <button
              onClick={() => setPeriodType('period')}
              className={`px-3 py-1 text-sm rounded-md ${periodType === 'period' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-[var(--surface)]'}`}
            >
              Período
            </button>
          </div>
          {periodType === 'month' ? (
            <div>
              <label htmlFor="month-select" className="sr-only">Selecione o Mês</label>
              <input
                type="month"
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm"
              />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label htmlFor="start-date" className="text-sm mr-2">De:</label>
                <input
                  type="date"
                  id="start-date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="text-sm mr-2">Até:</label>
                <input
                  type="date"
                  id="end-date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Row 1: Period Summary (Full Width) */}
        <div className="lg:col-span-6">
          <PeriodSummaryCard transactions={analysisTransactions} />
        </div>

        {/* Row 2: Income and Expenses (50/50) */}
        <div className="lg:col-span-3">
          <SpendingByCategoryCard
            transactions={analysisTransactions.filter(t => t.type === 'income')}
            paymentMethods={[PaymentMethod.PIX, PaymentMethod.DINHEIRO, PaymentMethod.OUTRO]}
            title="Receitas por Categoria"
            icon="fa-chart-line"
          />
        </div>
        <div className="lg:col-span-3">
          <SpendingByCategoryCard
            transactions={analysisTransactions}
            paymentMethods={[PaymentMethod.CREDITO, PaymentMethod.DEBITO, PaymentMethod.PIX, PaymentMethod.DINHEIRO, PaymentMethod.OUTRO]}
            title="Despesas por Categoria"
            icon="fa-chart-pie"
          />
        </div>

        {/* Row 3: Credit and Debit (1/2 each) */}
        <div className="lg:col-span-3">
          <SpendingByCategoryCard
            transactions={analysisTransactions}
            paymentMethods={[PaymentMethod.CREDITO]}
            title="Gastos com Crédito"
            icon="fa-regular fa-credit-card"
            footer={<CreditCardFooter />}
          />
        </div>
        <div className="lg:col-span-3">
          <SpendingByCategoryCard
            transactions={analysisTransactions}
            paymentMethods={[PaymentMethod.DEBITO, PaymentMethod.PIX, PaymentMethod.DINHEIRO, PaymentMethod.OUTRO]}
            title="Gastos com Débito e Outros"
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
      </div>
    </div>
  );
};

export default ReportsView;
