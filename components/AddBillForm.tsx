import React, { useState, useEffect } from 'react';
import { Bill } from '../types';
import { categories, expenseCategoryList } from '../categories';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Checkbox } from './ui/checkbox';

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
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Adicionar Conta Recorrente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="bill-description">Descrição da Conta</Label>
            <Input
              type="text"
              id="bill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Fatura do Cartão, Internet"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bill-due-day">Dia do Vencimento (1-31)</Label>
            <Input
              type="number"
              id="bill-due-day"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              placeholder="Ex: 10"
              min={1}
              max={31}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="bill-auto-debit"
              checked={isAutoDebit}
              onChange={(e) => setIsAutoDebit(e.target.checked)}
            />
            <Label htmlFor="bill-auto-debit">É Débito Automático com valor fixo?</Label>
          </div>

          {isAutoDebit && (
            <div className="space-y-4 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
              <p className="text-xs text-[var(--color-text-muted)]">Ao preencher, um lançamento recorrente será criado automaticamente.</p>
              <div className="grid gap-2">
                <Label htmlFor="bill-amount">Valor Fixo Mensal (R$)</Label>
                <Input
                  type="number"
                  id="bill-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 59.90"
                  step="0.01"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bill-category">Categoria</Label>
                  <Select id="bill-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="" disabled>Selecione</option>
                    {expenseCategoryList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bill-subcategory">Subcategoria</Label>
                  <Select
                    id="bill-subcategory"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    disabled={!category}
                  >
                    <option value="" disabled>Selecione</option>
                    {category && categories[category]?.subcategories.map(subcat => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
          <Button type="submit" className="w-full">Salvar Conta</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddBillForm;
