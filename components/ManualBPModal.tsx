import React, { useState, useEffect, useMemo } from 'react';
import { Payslip, PayslipLineItem } from '../types';

interface ManualBPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payslipData: Omit<Payslip, 'id'>, shouldLaunchTransaction: boolean) => void;
}

const ManualBPModal: React.FC<ManualBPModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [monthYear, setMonthYear] = useState('');
  const [payments, setPayments] = useState<PayslipLineItem[]>([{ description: '', value: 0 }]);
  const [deductions, setDeductions] = useState<PayslipLineItem[]>([{ description: '', value: 0 }]);
  const [shouldLaunchTransaction, setShouldLaunchTransaction] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      // Format as YYYY-MM
      setMonthYear(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      setPayments([{ description: 'Salário', value: 0 }]);
      setDeductions([{ description: '', value: 0 }]);
      setShouldLaunchTransaction(true);
      setError('');
    }
  }, [isOpen]);

  const totals = useMemo(() => {
    const grossTotal = payments.reduce((acc, p) => acc + Number(p.value || 0), 0);
    const deductionsTotal = deductions.reduce((acc, d) => acc + Number(d.value || 0), 0);
    const netTotal = grossTotal - deductionsTotal;
    return { grossTotal, deductionsTotal, netTotal };
  }, [payments, deductions]);

  const handleItemChange = (type: 'payments' | 'deductions', index: number, field: 'description' | 'value', value: string | number) => {
    const list = type === 'payments' ? [...payments] : [...deductions];
    const item = { ...list[index] };
    if (field === 'description') {
      item.description = String(value);
    } else {
      item.value = Number(value);
    }
    list[index] = item;
    if (type === 'payments') setPayments(list);
    else setDeductions(list);
  };
  
  const handleAddItem = (type: 'payments' | 'deductions') => {
    if (type === 'payments') {
      setPayments([...payments, { description: '', value: 0 }]);
    } else {
      setDeductions([...deductions, { description: '', value: 0 }]);
    }
  };
  
  const handleRemoveItem = (type: 'payments' | 'deductions', index: number) => {
    if (type === 'payments') {
      if (payments.length > 1) setPayments(payments.filter((_, i) => i !== index));
    } else {
      if (deductions.length > 1) setDeductions(deductions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    setError('');
    if (!monthYear) {
        setError('Por favor, selecione o mês e ano.');
        return;
    }
    const [year, month] = monthYear.split('-').map(Number);

    const validPayments = payments.filter(p => p.description.trim() && !isNaN(p.value));
    const validDeductions = deductions.filter(d => d.description.trim() && !isNaN(d.value));

    if (validPayments.length === 0 || totals.grossTotal <= 0) {
        setError('Adicione pelo menos um pagamento com valor positivo.');
        return;
    }

    const payslipData: Omit<Payslip, 'id'> = {
        month,
        year,
        payments: validPayments,
        deductions: validDeductions,
        grossTotal: totals.grossTotal,
        deductionsTotal: totals.deductionsTotal,
        netTotal: totals.netTotal
    };

    onConfirm(payslipData, shouldLaunchTransaction);
    onClose();
  };


  if (!isOpen) return null;
  
  const renderItemList = (type: 'payments' | 'deductions', items: PayslipLineItem[]) => (
      <div>
          <h4 className={`font-bold mb-2 ${type === 'payments' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {type === 'payments' ? 'Pagamentos' : 'Descontos'}
          </h4>
          <ul className="space-y-2">
            {items.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                    <input 
                        type="text" 
                        placeholder="Descrição" 
                        value={item.description}
                        onChange={(e) => handleItemChange(type, index, 'description', e.target.value)}
                        className="flex-grow bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 text-sm"
                    />
                    <input 
                        type="number" 
                        placeholder="Valor" 
                        value={item.value || ''}
                        onChange={(e) => handleItemChange(type, index, 'value', e.target.valueAsNumber || 0)}
                        className="w-32 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 text-sm text-right"
                        step="0.01"
                    />
                    <button 
                        onClick={() => handleRemoveItem(type, index)}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                        disabled={items.length <= 1}
                    >
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </li>
            ))}
          </ul>
          <button onClick={() => handleAddItem(type)} className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold">
            + Adicionar {type === 'payments' ? 'Pagamento' : 'Desconto'}
          </button>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Lançar Contracheque Manualmente</h2>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow space-y-4">
            <div>
                <label htmlFor="month-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mês de Referência</label>
                <input 
                    type="month" 
                    id="month-year" 
                    value={monthYear} 
                    onChange={e => setMonthYear(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderItemList('payments', payments)}
                {renderItemList('deductions', deductions)}
            </div>
            
             <div className="flex justify-around bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-center font-bold mt-4">
                <div><span className="block text-xs text-gray-500">Total Bruto</span> <span className="text-green-600">{totals.grossTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                <div><span className="block text-xs text-gray-500">Total Descontos</span> <span className="text-red-600">{totals.deductionsTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                <div><span className="block text-xs text-gray-500">Total Líquido</span> <span className="text-indigo-600 text-lg">{totals.netTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
            </div>
            {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <div className="flex items-center">
                <input 
                    type="checkbox" 
                    id="launch-transaction" 
                    checked={shouldLaunchTransaction} 
                    onChange={e => setShouldLaunchTransaction(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="launch-transaction" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Lançar transação de receita com o valor líquido</label>
            </div>
            <div className="flex space-x-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    Salvar Contracheque
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ManualBPModal;