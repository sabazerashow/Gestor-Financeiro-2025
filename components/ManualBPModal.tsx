import React, { useState, useEffect, useMemo } from 'react';
import { Payslip, PayslipLineItem } from '../types';

interface ManualBPModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Omit<Payslip, 'id'> | null;
  onConfirm: (payslipData: Omit<Payslip, 'id'>, shouldLaunchTransaction: boolean) => void;
}

const ManualBPModal: React.FC<ManualBPModalProps> = ({ isOpen, onClose, initialData, onConfirm }) => {
  const [monthYear, setMonthYear] = useState('');
  const [payments, setPayments] = useState<PayslipLineItem[]>([{ description: '', value: 0 }]);
  const [deductions, setDeductions] = useState<PayslipLineItem[]>([{ description: '', value: 0 }]);
  const [shouldLaunchTransaction, setShouldLaunchTransaction] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setMonthYear(`${initialData.year}-${String(initialData.month).padStart(2, '0')}`);
        setPayments(initialData.payments.length > 0 ? initialData.payments : [{ description: 'Salário', value: 0 }]);
        setDeductions(initialData.deductions.length > 0 ? initialData.deductions : [{ description: '', value: 0 }]);
      } else {
        const now = new Date();
        setMonthYear(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
        setPayments([{ description: 'Salário', value: 0 }]);
        setDeductions([{ description: '', value: 0 }]);
      }
      setShouldLaunchTransaction(true);
      setError('');
    }
  }, [isOpen, initialData]);

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

  const handleReorderItem = (type: 'payments' | 'deductions', index: number, direction: 'up' | 'down') => {
    if (type === 'payments') {
      const list = [...payments];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= list.length) return;
      const [item] = list.splice(index, 1);
      list.splice(newIndex, 0, item);
      setPayments(list);
    } else {
      const list = [...deductions];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= list.length) return;
      const [item] = list.splice(index, 1);
      list.splice(newIndex, 0, item);
      setDeductions(list);
    }
  };

  const moveItemBetweenLists = (from: 'payments' | 'deductions', index: number) => {
    if (from === 'payments') {
      const src = [...payments];
      const [item] = src.splice(index, 1);
      setPayments(src);
      setDeductions([...deductions, item]);
    } else {
      const src = [...deductions];
      const [item] = src.splice(index, 1);
      setDeductions(src);
      setPayments([...payments, item]);
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
    <div className="flex flex-col h-full bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
      <h4 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${type === 'payments' ? 'text-income' : 'text-expense'}`}>
        <i className={`fas ${type === 'payments' ? 'fa-plus-circle' : 'fa-minus-circle'}`}></i>
        {type === 'payments' ? 'Pagamentos' : 'Descontos'}
      </h4>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="grid grid-cols-[1fr_140px_auto] gap-2 items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-[var(--primary)]/30">
            <input
              type="text"
              placeholder="Descrição (ex: Soldo, NET)"
              value={item.description}
              onChange={(e) => handleItemChange(type, index, 'description', e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 placeholder:text-gray-300"
            />
            <div className="flex items-center bg-gray-50 rounded-lg px-2 border border-gray-100 focus-within:border-[var(--primary)] transition-all">
              <span className="text-[10px] font-bold text-gray-400 mr-1">R$</span>
              <input
                type="number"
                placeholder="0,00"
                value={item.value || ''}
                onChange={(e) => handleItemChange(type, index, 'value', e.target.valueAsNumber || 0)}
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-right font-bold text-gray-900 placeholder:text-gray-300"
                step="0.01"
              />
            </div>
            <div className="flex items-center gap-1 pl-1 border-l border-gray-100">
              <button title="Subir" onClick={() => handleReorderItem(type, index, 'up')} className="w-6 h-6 flex items-center justify-center text-[10px] rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                <i className="fas fa-chevron-up"></i>
              </button>
              <button title="Descer" onClick={() => handleReorderItem(type, index, 'down')} className="w-6 h-6 flex items-center justify-center text-[10px] rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                <i className="fas fa-chevron-down"></i>
              </button>
              <button title="Trocar lado (Pagamento <> Desconto)" onClick={() => moveItemBetweenLists(type, index)} className="w-6 h-6 flex items-center justify-center text-[10px] rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                <i className="fas fa-right-left"></i>
              </button>
              <button
                title="Remover"
                onClick={() => handleRemoveItem(type, index)}
                className="w-8 h-8 flex items-center justify-center text-xs rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-0"
                disabled={items.length <= 1}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => handleAddItem(type)} className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-xs font-bold uppercase tracking-widest">
        <i className="fas fa-plus"></i>
        Adicionar {type === 'payments' ? 'Pagamento' : 'Desconto'}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Lançar Contracheque Manualmente</h2>
            <p className="text-xs text-gray-400 mt-1">Insira os detalhes da sua remuneração e descontos.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-grow space-y-8 custom-scrollbar">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-64">
              <label htmlFor="month-year" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mês de Referência</label>
              <input
                type="month"
                id="month-year"
                value={monthYear}
                onChange={e => setMonthYear(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {renderItemList('payments', payments)}
            {renderItemList('deductions', deductions)}
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100 mt-8">
            <div className="text-center md:text-left">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Bruto</span>
              <span className="text-2xl font-black text-income tabular-nums">{totals.grossTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Descontos</span>
              <span className="text-2xl font-black text-expense tabular-nums">{totals.deductionsTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="text-center md:text-right md:border-l md:border-gray-200 md:pl-8">
              <span className="block text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-1">Total Líquido</span>
              <span className="text-3xl font-black text-gray-900 tabular-nums">{totals.netTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600">
              <i className="fas fa-exclamation-circle"></i>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center group cursor-pointer" onClick={() => setShouldLaunchTransaction(!shouldLaunchTransaction)}>
            <div className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center transition-all ${shouldLaunchTransaction ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-gray-300'}`}>
              {shouldLaunchTransaction && <i className="fas fa-check text-[10px] text-white"></i>}
            </div>
            <label className="text-xs font-bold text-gray-500 cursor-pointer select-none">Lançar transação de receita com o valor líquido</label>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="flex-1 md:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 md:flex-none px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] shadow-lg shadow-[var(--primary)]/20 transition-all active:scale-[0.98]"
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
