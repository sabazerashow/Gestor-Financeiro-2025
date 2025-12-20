
import React from 'react';
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
    <li className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-[var(--surface)] rounded-lg">
      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
        <i className="fas fa-bell text-[var(--primary)]"></i>
        <div>
          <p className="font-semibold text-[var(--color-text)]">{bill.description}</p>
          <p className={`text-sm ${textColor}`}>{dueDateText}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 self-end sm:self-center">
        <button
          onClick={() => onPayBill(bill.description)}
          className="px-3 py-1 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors"
        >
          Pagar Conta
        </button>
      </div>
    </li>
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
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm min-h-[680px]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
          <i className="fas fa-file-invoice-dollar"></i>
        </div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contas a Pagar</h2>
      </div>

      <div className="overflow-y-auto pr-2 custom-scrollbar" style={{ height: '500px' }}>
        {upcoming.length === 0 ? (
          <p className="text-gray-300 text-center py-8 italic text-sm">Nenhuma conta próxima do vencimento.</p>
        ) : (
          <ul className="space-y-3">
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
