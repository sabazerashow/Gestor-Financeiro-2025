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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Editar Transação</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <input
              type="text"
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={!!transaction.installmentDetails}
            />
             {transaction.installmentDetails && <p className="text-xs text-gray-400 mt-1">A descrição de transações parceladas não pode ser editada individualmente.</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
              <input
                type="number"
                id="edit-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
              <input
                type="date"
                id="edit-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                <select
                id="edit-category"
                value={category}
                onChange={(e) => {
                    setCategory(e.target.value)
                    setSubcategory(categories[e.target.value]?.subcategories[0] || '')
                }}
                className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                <option value="" disabled>Selecione</option>
                {currentCategoryList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                </select>
            </div>
            <div>
                <label htmlFor="edit-subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subcategoria</label>
                <select
                id="edit-subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            <label htmlFor="edit-paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Método de Pagamento</label>
            <select
              id="edit-paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {Object.values(PaymentMethod).map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</span>
            <div className="mt-2 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="edit-type"
                  value={TransactionType.INCOME}
                  checked={type === TransactionType.INCOME}
                  onChange={() => setType(TransactionType.INCOME)}
                  className="form-radio h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-gray-300"
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
                  className="form-radio h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-gray-300"
                />
                <span className="ml-2 text-sm text-expense">Despesa</span>
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </form>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionModal;
