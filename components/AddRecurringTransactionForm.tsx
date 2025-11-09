
import React, { useState } from 'react';
import { RecurringTransaction, TransactionType, Frequency } from '../types';
// FIX: Correctly import 'expenseCategoryList' instead of the non-existent 'categoryList'.
import { expenseCategoryList } from '../categories';

interface AddRecurringTransactionFormProps {
  onAddRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => void;
}

const AddRecurringTransactionForm: React.FC<AddRecurringTransactionFormProps> = ({ onAddRecurringTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !category || !startDate) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, insira um valor numérico positivo.');
      return;
    }

    onAddRecurringTransaction({
      description,
      amount: numericAmount,
      type: TransactionType.EXPENSE,
      category,
      // FIX: Add subcategory to the recurring transaction object.
      subcategory: '',
      frequency: Frequency.MONTHLY,
      startDate,
      nextDueDate: startDate,
    });

    setDescription('');
    setAmount('');
    setError('');
    setCategory('');
    setStartDate(new Date().toISOString().split('T')[0]);
  };

  // FIX: Use the correctly imported 'expenseCategoryList' directly. The old filter is no longer needed.
  const expenseCategories = expenseCategoryList;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Adicionar Débito Automático</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rec-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
          <input
            type="text"
            id="rec-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: Assinatura Netflix"
          />
        </div>
        <div>
          <label htmlFor="rec-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Mensal (R$)</label>
          <input
            type="number"
            id="rec-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: 39.90"
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label htmlFor="rec-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
          <select
            id="rec-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>Selecione uma categoria</option>
            {expenseCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rec-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data do Primeiro Vencimento</label>
          <input
            type="date"
            id="rec-start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Agendar Débito
        </button>
      </form>
    </div>
  );
};

export default AddRecurringTransactionForm;
