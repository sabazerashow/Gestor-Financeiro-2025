import React from 'react';
import { motion } from 'framer-motion';
import { Bill, Transaction, TransactionType } from '../types';

interface UpcomingPaymentsProps {
  bills: Bill[];
  onPayBill: (description: string) => void;
  transactions: Transaction[];
}

const UpcomingPaymentItem: React.FC<{ bill: Bill; dueDate: Date; onPayBill: (description: string) => void }> = ({ bill, dueDate, onPayBill }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let dueDateText = '';
  let textColor = 'text-[var(--color-text-muted)]';

  if (diffDays < 0) {
    dueDateText = `Vencido há ${Math.abs(diffDays)} dia(s)`;
    textColor = 'text-[var(--destructive)] font-bold';
  } else if (diffDays === 0) {
    dueDateText = 'Vence hoje';
    textColor = 'text-[var(--warning)] font-bold';
  } else if (diffDays <= 3) {
    dueDateText = `Vence em ${diffDays} dia(s)`;
    textColor = 'text-[var(--warning-muted)]';
  } else {
    dueDateText = `Vence em ${diffDays} dia(s)`;
  }

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 group hover:bg-white hover:border-[var(--primary)]/20 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${diffDays < 0 ? 'bg-red-50 text-red-500' : 'bg-[var(--primary)]/10 text-[var(--primary)]'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <i className={`fas ${diffDays < 0 ? 'fa-exclamation-circle' : 'fa-calendar-day'} text-lg`}></i>
        </div>
        <div>
          <p className="font-black text-sm text-gray-900 tracking-tight">{bill.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-black uppercase tracking-widest ${textColor}`}>{dueDateText}</span>
            <span className="text-[10px] text-gray-300 font-bold">•</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => onPayBill(bill.description)}
        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white text-gray-900 border border-gray-100 hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-all shadow-sm"
      >
        Pagar
      </button>
    </motion.li>
  );
};


const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ bills, onPayBill, transactions }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Use a consistent start-of-day for comparisons
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const upcoming = bills
    .filter(bill => !bill.isAutoDebit)
    .map(bill => {
      // The due date for the current calendar month
      const dueDate = new Date(currentYear, currentMonth, bill.dueDay);
      return { bill, dueDate };
    })
    .filter(({ bill }) => {
      // Filter out bills that have already been paid this month.
      const hasBeenPaidThisMonth = transactions.some(t =>
        t.type === TransactionType.EXPENSE &&
        t.description.toLowerCase().includes(bill.description.toLowerCase()) &&
        new Date(t.date + 'T00:00:00').getMonth() === currentMonth &&
        new Date(t.date + 'T00:00:00').getFullYear() === currentYear
      );
      return !hasBeenPaidThisMonth;
    })
    .filter(({ dueDate }) => {
      // Show reminders for bills that are overdue or due within the next 15 days.
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      // Show if overdue (diffDays < 0) or upcoming in the next 15 days (0 <= diffDays <= 15)
      return diffDays <= 15;
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className="bg-white p-6 md:p-8 rounded-[var(--radius-lg)] border border-gray-100 shadow-[var(--card-shadow)] h-full flex flex-col min-h-[400px] md:min-h-[680px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
            <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contas Próximas</h2>
        </div>
        <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-100">
          {upcoming.length} Pendentes
        </div>
      </div>

      <div className="overflow-y-auto pr-2 flex-1 custom-scrollbar">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <i className="fas fa-check-circle text-2xl"></i>
            </div>
            <p className="text-sm font-bold text-gray-900">Tudo em dia!</p>
            <p className="text-xs text-gray-400 mt-1">Nenhuma conta pendente para os próximos 15 dias.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {upcoming.map(({ bill, dueDate }) => (
              <UpcomingPaymentItem key={bill.id} bill={bill} dueDate={dueDate} onPayBill={onPayBill} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UpcomingPayments;
