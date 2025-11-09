import React, { useState, useEffect } from 'react';
import { Bill } from '../types';
import { categories, expenseCategoryList } from '../categories';

interface AddBillFormProps {
  onAddBill: (bill: Omit<Bill, 'id' | 'recurringTransactionId'>) => void;
}

const AddBillForm: React.FC<AddBillFormProps> = ({ onAddBill }) => {
  const [description, setDescription] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [isAutoDebit, setIsAutoDebit] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    // When category changes, reset subcategory and set a default if possible
    if (category && categories[category]) {
      setSubcategory(categories[category].subcategories[0]);
    } else {
      setSubcategory('');
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const day = parseInt(dueDay, 10);

    if (!description || !dueDay) {
      setError('Descrição e dia do vencimento são obrigatórios.');
      return;
    }
    if (isNaN(day) || day < 1 || day > 31) {
      setError('O dia do vencimento deve ser um número entre 1 e 31.');
      return;
    }

    let billData: Omit<Bill, 'id' | 'recurringTransactionId'> = {
        description,
        dueDay: day,
        isAutoDebit,
    };

    if (isAutoDebit) {
        const numericAmount = parseFloat(amount);
        if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
            setError('Para débito automático, o valor fixo é obrigatório.');
            return;
        }
        if (!category || !subcategory) {
            setError('Para débito automático, a categoria e a subcategoria são obrigatórias.');
            return;
        }
        billData = { ...billData, amount: numericAmount, category, subcategory };
    }

    onAddBill(billData);

    setDescription('');
    setDueDay('');
    setIsAutoDebit(false);
    setAmount('');
    setCategory('');
    setSubcategory('');
    setError('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-fit">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Adicionar Conta Recorrente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bill-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição da Conta</label>
          <input
            type="text"
            id="bill-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: Fatura do Cartão, Internet"
          />
        </div>
        <div>
          <label htmlFor="bill-due-day" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dia do Vencimento (1-31)</label>
          <input
            type="number"
            id="bill-due-day"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Ex: 10"
            min="1"
            max="31"
          />
        </div>
        <div className="flex items-center">
          <input
            id="bill-auto-debit"
            type="checkbox"
            checked={isAutoDebit}
            onChange={(e) => setIsAutoDebit(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="bill-auto-debit" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            É Débito Automático com valor fixo?
          </label>
        </div>
        
        {isAutoDebit && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 animate-fade-in">
                 <p className="text-xs text-gray-500 dark:text-gray-400">Ao preencher, um lançamento recorrente será criado automaticamente.</p>
                 <div>
                    <label htmlFor="bill-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Fixo Mensal (R$)</label>
                    <input
                        type="number"
                        id="bill-amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Ex: 59.90"
                        step="0.01"
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="bill-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                        <select
                            id="bill-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="" disabled>Selecione</option>
                            {expenseCategoryList.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="bill-subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subcategoria</label>
                        <select
                            id="bill-subcategory"
                            value={subcategory}
                            onChange={(e) => setSubcategory(e.target.value)}
                            className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={!category}
                        >
                            <option value="" disabled>Selecione</option>
                             {category && categories[category]?.subcategories.map(subcat => (
                                <option key={subcat} value={subcat}>{subcat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Salvar Conta
        </button>
      </form>
    </div>
  );
};

export default AddBillForm;