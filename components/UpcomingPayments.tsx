
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
    textColor = 'text-red-500 font-bold';
  } else if (diffDays === 0) {
    dueDateText = 'Vence hoje';
    textColor = 'text-orange-500 font-bold';
  } else if (diffDays <= 3) {
    dueDateText = `Vence em ${diffDays} dia(s)`;
    textColor = 'text-yellow-500';
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
            className="px-3 py-1 text-sm font-medium rounded-md text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors"
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
    <div className="bg-[var(--card)] p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-[var(--color-text)]">Lembretes de Pagamentos</h2>
        {upcoming.length === 0 ? (
            <p className="text-[var(--color-text-muted)] text-center py-8">Nenhum pagamento manual pendente para os próximos 15 dias.</p>
        ) : (
            <ul className="space-y-3">
                {upcoming.map(({bill, dueDate}) => (
                <UpcomingPaymentItem key={bill.id} bill={bill} dueDate={dueDate} onPayBill={onPayBill} />
                ))}
            </ul>
        )}
    </div>
  );
};

export default UpcomingPayments;
