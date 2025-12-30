import React from 'react';
import { Bill } from '../types';

interface BillListProps {
  bills: Bill[];
  onDelete: (id: string) => void;
  onEdit: (bill: Bill) => void;
}

const BillItem: React.FC<{ bill: Bill; onDelete: (id: string) => void; onEdit: (bill: Bill) => void }> = ({ bill, onDelete, onEdit }) => {
  return (
    <li className="flex items-center justify-between p-3 bg-[var(--surface)] rounded-lg transition-shadow hover:shadow-md">
      <div className="flex-grow min-w-0 flex items-center space-x-3">
        {bill.isAutoDebit ? (
          <i className="fas fa-check-circle text-[var(--success)]" title="Em Débito Automático"></i>
        ) : (
          <i className="fas fa-exclamation-circle text-[var(--warning)]" title="Pagamento Manual"></i>
        )}
        <div>
          <p className="font-semibold text-[var(--color-text)] truncate">{bill.description}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm text-[var(--color-text-muted)]">Vence todo dia {String(bill.dueDay).padStart(2, '0')}</p>
            {bill.paymentUrl && (
              <a
                href={bill.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fas fa-external-link-alt text-[10px]"></i>
                Pagar
              </a>
            )}
            {(bill.paymentUser || bill.paymentPass) && (
              <div className="flex items-center gap-2 text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                <i className="fas fa-key text-[8px]"></i>
                {bill.paymentUser && <span title="Usuário">U: {bill.paymentUser}</span>}
                {bill.paymentPass && <span title="Senha">•: {bill.paymentPass}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4 ml-4">
        <button
          onClick={() => onEdit(bill)}
          className="text-[var(--color-text-muted)] hover:text-[var(--primary)] transition-colors"
          aria-label={`Editar conta ${bill.description}`}
        >
          <i className="fas fa-edit"></i>
        </button>
        <button
          onClick={() => onDelete(bill.id)}
          className="text-[var(--color-text-muted)] hover:text-[var(--danger)] transition-colors"
          aria-label={`Deletar conta ${bill.description}`}
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
    </li>
  );
};

const BillList: React.FC<BillListProps> = ({ bills, onDelete, onEdit }) => {
  const sortedBills = [...bills].sort((a, b) => a.dueDay - b.dueDay);

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
          <i className="fas fa-list-check"></i>
        </div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">CONTAS CADASTRADAS</h2>
      </div>
      {bills.length === 0 ? (
        <p className="text-[var(--color-text-muted)] text-center py-8">Nenhuma conta cadastrada.</p>
      ) : (
        <ul className="space-y-3">
          {sortedBills.map(bill => (
            <BillItem key={bill.id} bill={bill} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default BillList;
