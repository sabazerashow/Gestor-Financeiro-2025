
import React, { useState } from 'react';
import { RecurringTransaction, TransactionType, Frequency } from '../types';
// FIX: Correctly import 'expenseCategoryList' instead of the non-existent 'categoryList'.
import { expenseCategoryList } from '../categories';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select } from './ui/select';

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
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Adicionar Débito Automático</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="rec-description">Descrição</Label>
            <Input
              type="text"
              id="rec-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Assinatura Netflix"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rec-amount">Valor Mensal (R$)</Label>
            <Input
              type="number"
              id="rec-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 39.90"
              step="0.01"
              min="0"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rec-category">Categoria</Label>
            <Select id="rec-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="" disabled>Selecione uma categoria</option>
              {expenseCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rec-start-date">Data do Primeiro Vencimento</Label>
            <Input
              type="date"
              id="rec-start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
          <Button type="submit" className="w-full">Agendar Débito</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddRecurringTransactionForm;
