import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { categories, expenseCategoryList, incomeCategoryList } from '../categories';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onUpdate: (id: string, transaction: Omit<Transaction, 'id'>) => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, transaction, onUpdate }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DEBITO);
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setType(transaction.type);
      setCategory(transaction.category || '');
      setSubcategory(transaction.subcategory || '');
      setPaymentMethod(transaction.paymentMethod || PaymentMethod.DEBITO);
      setDate(transaction.date);
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !category || !subcategory || !date) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, insira um valor numérico positivo.');
      return;
    }

    onUpdate(transaction.id, {
      ...transaction, // Preserve fields like installmentDetails
      description,
      amount: numericAmount,
      type,
      date,
      category,
      subcategory,
      paymentMethod,
    });

    onClose();
  };

  if (!isOpen) return null;
  
  const currentCategoryList = type === TransactionType.INCOME ? incomeCategoryList : expenseCategoryList;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-[var(--card)] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--color-text)]">Editar Transação</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-[var(--color-text)]">Descrição</label>
            <input
              type="text"
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm"
              disabled={!!transaction.installmentDetails}
            />
             {transaction.installmentDetails && <p className="text-xs text-[var(--color-text-muted)] mt-1">A descrição de transações parceladas não pode ser editada individualmente.</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-amount" className="block text-sm font-medium text-[var(--color-text)]">Valor (R$)</label>
              <input
                type="number"
                id="edit-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="edit-date" className="block text-sm font-medium text-[var(--color-text)]">Data</label>
              <input
                type="date"
                id="edit-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-[var(--color-text)]">Categoria</label>
                <select
                id="edit-category"
                value={category}
                onChange={(e) => {
                    setCategory(e.target.value)
                    setSubcategory(categories[e.target.value]?.subcategories[0] || '')
                }}
                className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm"
                >
                <option value="" disabled>Selecione</option>
                {currentCategoryList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                </select>
            </div>
            <div>
                <label htmlFor="edit-subcategory" className="block text-sm font-medium text-[var(--color-text)]">Subcategoria</label>
                <select
                id="edit-subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm"
                disabled={!category}
                >
                <option value="" disabled>Selecione</option>
                {category && categories[category]?.subcategories.map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                ))}
                </select>
            </div>
          </div>
          <div>
            <label htmlFor="edit-paymentMethod" className="block text-sm font-medium text-[var(--color-text)]">Método de Pagamento</label>
            <select
              id="edit-paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm"
            >
              {Object.values(PaymentMethod).map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="block text-sm font-medium text-[var(--color-text)]">Tipo</span>
            <div className="mt-2 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="edit-type"
                  value={TransactionType.INCOME}
                  checked={type === TransactionType.INCOME}
                  onChange={() => setType(TransactionType.INCOME)}
                  className="form-radio h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--border)]"
                />
                <span className="ml-2 text-sm text-income">Receita</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="edit-type"
                  value={TransactionType.EXPENSE}
                  checked={type === TransactionType.EXPENSE}
                  onChange={() => setType(TransactionType.EXPENSE)}
                  className="form-radio h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--border)]"
                />
                <span className="ml-2 text-sm text-expense">Despesa</span>
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-[var(--destructive)] mt-2">{error}</p>}
        </form>

        <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex justify-end space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--color-text)] bg-[var(--card)] hover:bg-[var(--color-surface-hover)] border border-[var(--border)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionModal;
