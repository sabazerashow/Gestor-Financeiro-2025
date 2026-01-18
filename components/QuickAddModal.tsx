import React, { useState, useEffect } from 'react';
// IA não é usada no QuickAdd: categorização fica "A verificar"
import { Transaction, TransactionType, PaymentMethod, paymentMethodDetails } from '../types';
import { categories, expenseCategoryList } from '../categories';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>, installmentCount?: number) => void;
  initialDescription?: string;
  initialMode?: 'ai' | 'manual';
}

interface ParsedTransaction {
  description: string;
  amount: number;
  category: string;
  subcategory: string;
  paymentMethod: PaymentMethod;
  date: string;
  installments: number;
}

const cleanJsonString = (str: string) => str.replace(/```json/g, '').replace(/```/g, '').trim();

const monthMap: Record<string, number> = {
  'janeiro': 1, 'jan': 1,
  'fevereiro': 2, 'fev': 2,
  'março': 3, 'marco': 3, 'mar': 3,
  'abril': 4, 'abr': 4,
  'maio': 5,
  'junho': 6, 'jun': 6,
  'julho': 7, 'jul': 7,
  'agosto': 8, 'ago': 8,
  'setembro': 9, 'set': 9,
  'outubro': 10, 'out': 10,
  'novembro': 11, 'nov': 11,
  'dezembro': 12, 'dez': 12,
};

const toISO = (y: number, m: number, d: number) => {
  const dt = new Date(y, m - 1, d);
  return dt.toISOString().split('T')[0];
};

const parseDateFromText = (text: string, todayISO: string): string => {
  const raw = text.toLowerCase();
  const today = new Date(todayISO + 'T00:00:00');

  if (raw.includes('ontem')) {
    const d = new Date(today); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0];
  }
  if (raw.includes('hoje')) {
    return todayISO;
  }

  // dd/mm/yyyy or dd/mm
  const dm = raw.match(/(\b\d{1,2})\s*[\/\-]\s*(\d{1,2})(?:[\/\-](\d{4}))?/);
  if (dm) {
    const d = parseInt(dm[1]);
    const m = parseInt(dm[2]);
    const y = dm[3] ? parseInt(dm[3]) : today.getFullYear();
    return toISO(y, m, d);
  }

  // "14 de dezembro" ou "14 dezembro"
  const named = raw.match(/\b(\d{1,2})\s*(?:de\s*)?(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|jun|jul|ago|set|out|nov|dez)\b/);
  if (named) {
    const d = parseInt(named[1]);
    const m = monthMap[named[2]] || today.getMonth() + 1;
    // Limit year hint to reasonable years (2020-2030) to avoid catching amounts like "2050 reais"
    const yearHintMatch = raw.match(/\b(202\d|2030)\b/);
    const y = yearHintMatch ? parseInt(yearHintMatch[1]) : today.getFullYear();
    return toISO(y, m, d);
  }

  // "dia 14" → mês/ano atuais
  const onlyDay = raw.match(/\bdia\s*(\d{1,2})\b/);
  if (onlyDay) {
    const d = parseInt(onlyDay[1]);
    return toISO(today.getFullYear(), today.getMonth() + 1, d);
  }

  return todayISO;
};

const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onAddTransaction, initialDescription, initialMode = 'ai' }) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedTransaction, setParsedTransaction] = useState<ParsedTransaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialDescription) {
        setInputValue(initialDescription + ' ');
      }
      if (initialMode === 'manual' && initialDescription) {
        setIsEditing(true);

        // Try to find a sensible default category based on bill description.
        let cat = 'Casa/Moradia';
        let sub = 'Contas Domésticas';
        const lowerDesc = initialDescription.toLowerCase();
        if (lowerDesc.includes('saúde') || lowerDesc.includes('plano')) {
          cat = 'Saúde'; sub = 'Consultas/Médicos';
        } else if (lowerDesc.includes('carro') || lowerDesc.includes('seguro')) {
          cat = 'Transporte'; sub = 'Combustível/Manutenção';
        }

        setParsedTransaction({
          description: initialDescription,
          amount: 0,
          category: cat,
          subcategory: sub,
          paymentMethod: PaymentMethod.DEBITO,
          date: new Date().toISOString().split('T')[0],
          installments: 1,
        });
      }
    }
  }, [isOpen, initialDescription, initialMode]);

  const paymentMethods = Object.values(PaymentMethod);

  const handleProcessInput = async () => {
    if (!inputValue.trim()) {
      setError("Por favor, digite uma descrição do seu gasto.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setParsedTransaction(null);
    setIsEditing(false);

    // Mantemos lista de categorias para edição manual, mas não chamamos IA

    const today = new Date().toISOString().split('T')[0];

    // Lightweight local parser as fallback when AI is unavailable or fails
    const localParse = (text: string): ParsedTransaction | null => {
      let raw = text.toLowerCase();
      let cleanText = text;

      // 1. Extract Amount
      const amountMatch = raw.match(/(\d+[\.,]?\d*)\s*(reais|r\$|rs)?/);
      if (!amountMatch) return null;
      const amount = parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.'));
      
      // Remove amount from description (and "reais" etc)
      const amountRegex = new RegExp(amountMatch[0], 'i');
      cleanText = cleanText.replace(amountRegex, '');

      // 2. Extract Installments
      const installmentsMatch = raw.match(/(\d+)\s*x/);
      const installments = installmentsMatch ? parseInt(installmentsMatch[1]) : 1;
      if (installmentsMatch) {
         cleanText = cleanText.replace(new RegExp(installmentsMatch[0], 'i'), '');
      }

      // 3. Extract Payment Method
      let paymentMethod: PaymentMethod = PaymentMethod.OUTRO;
      const paymentPatterns = [
        { key: PaymentMethod.CREDITO, patterns: ['crédito', 'credito', 'cartao', 'cartão'] },
        { key: PaymentMethod.DEBITO, patterns: ['débito', 'debito'] },
        { key: PaymentMethod.PIX, patterns: ['pix'] },
        { key: PaymentMethod.DINHEIRO, patterns: ['dinheiro'] },
        { key: PaymentMethod.OUTRO, patterns: ['boleto'] }
      ];

      for (const p of paymentPatterns) {
        const found = p.patterns.find(pat => raw.includes(pat));
        if (found) {
          paymentMethod = p.key;
          // Remove payment method text from description
          // We use a regex to match the word with optional surrounding punctuation/spaces
          // e.g. " no crédito " -> remove "crédito"
          // ideally we remove "no crédito" but that's harder. Let's just remove the keyword.
          const patRegex = new RegExp(`\\b${found}\\b`, 'gi');
          cleanText = cleanText.replace(patRegex, '');
          break; // Stop after first match
        }
      }

      // 4. Extract Category (Keyword Mapping) - No removal from description needed usually
      let category = 'Outros';
      let subcategory = 'Presentes';
      const map: Array<{ k: RegExp, c: string, s: string }> = [
        { k: /(cinema|filme|movie)/, c: 'Lazer', s: 'Entretenimento' },
        { k: /(restaurante|jantar|almoço|ifood|delivery)/, c: 'Alimentação', s: 'Delivery/Apps' },
        { k: /(supermercado|mercado|compras)/, c: 'Alimentação', s: 'Supermercado/Compras' },
        { k: /(combustível|gasolina|posto)/, c: 'Transporte', s: 'Combustível/Manutenção' },
        { k: /(internet|luz|energia|conta|telefone|vivo|claro|tim|oi)/, c: 'Casa/Moradia', s: 'Contas Domésticas' },
        { k: /(saúde|plano|consulta|médico)/, c: 'Saúde', s: 'Consultas/Médicos' },
        { k: /(uber|99|taxi)/, c: 'Transporte', s: 'Transporte' },
      ];
      
      // Update raw for category matching (keywords might have been removed? No, we used original raw for basic matching)
      // Actually we should match against the original raw or the partially cleaned one? 
      // Let's use the original raw for safety, but maybe we should use the cleaned one to avoid matching removed words?
      // For now, original raw is fine.
      for (const m of map) { if (m.k.test(raw)) { category = m.c; subcategory = m.s; break; } }

      // 5. Extract Date
      const date = parseDateFromText(text, today);
      // Try to remove date strings like "dia 15", "ontem", "hoje"
      const datePatterns = [
         /\bdia\s*\d{1,2}\b/gi,
         /\bhoje\b/gi,
         /\bontem\b/gi,
         /\b\d{1,2}\s*(?:de\s*)?(?:janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|jun|jul|ago|set|out|nov|dez)\b/gi,
         /\b\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{4})?\b/gi
      ];
      for (const dp of datePatterns) {
        cleanText = cleanText.replace(dp, '');
      }

      // 6. Final Cleanup of Description
      // Remove common prepositions/connectors often left dangling: "no", "em", "de", "-", "pelo"
      // And remove extra spaces, non-alphanumeric at start/end
      cleanText = cleanText
        .replace(/\b(no|na|em|de|do|da|por|pelo|pela)\b/gi, ' ') // Remove connectors
        .replace(/[\s\-\.,]+$/g, '') // Remove trailing punctuation
        .replace(/^[\s\-\.,]+/g, '') // Remove leading punctuation
        .replace(/\s+/g, ' ') // Collapse spaces
        .trim();

      // Capitalize first letter
      const description = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);

      return { description: description || 'Despesa', amount, category, subcategory, paymentMethod, date, installments };
    };

    try {
      const local = localParse(inputValue);
      if (!local) {
        setError('Por favor, informe um valor (ex.: 85 reais)');
        return;
      }
      // Marcar sempre como "A verificar > A classificar"
      setParsedTransaction({
        ...local,
        category: 'A verificar',
        subcategory: categories['A verificar']?.subcategories[0] || 'A classificar',
      });
    } catch (e: any) {
      console.error(e);
      setError('Falha ao processar entrada. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!parsedTransaction) return;

    onAddTransaction({
      description: parsedTransaction.description,
      amount: parsedTransaction.amount,
      category: parsedTransaction.category,
      subcategory: parsedTransaction.subcategory,
      paymentMethod: parsedTransaction.paymentMethod,
      type: TransactionType.EXPENSE,
      date: parsedTransaction.date,
    }, parsedTransaction.installments > 1 ? parsedTransaction.installments : undefined);
    handleClose();
  };

  const handleClose = () => {
    setInputValue('');
    setIsProcessing(false);
    setError(null);
    setParsedTransaction(null);
    setIsEditing(false);
    onClose();
  };

  const handleEditChange = (field: keyof ParsedTransaction, value: string | number) => {
    if (!parsedTransaction) return;

    const updatedTransaction = { ...parsedTransaction, [field]: value };

    // If category changes, reset subcategory
    if (field === 'category') {
      updatedTransaction.subcategory = categories[value as string]?.subcategories[0] || '';
    }

    setParsedTransaction(updatedTransaction);
  }

  if (!isOpen) return null;

  const categoryInfo = parsedTransaction ? categories[parsedTransaction.category] : null;
  const paymentInfo = parsedTransaction ? paymentMethodDetails[parsedTransaction.paymentMethod] : null;

  const renderContent = () => {
    if (isEditing && parsedTransaction) {
      return (
        <div className="space-y-3 animate-fade-in">
          <div>
            <label className="text-xs text-[var(--color-text-muted)]">Descrição</label>
            <input type="text" value={parsedTransaction.description} onChange={e => handleEditChange('description', e.target.value)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md py-1 px-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)]">Valor Total</label>
              <input type="number" placeholder="0,00" value={parsedTransaction.amount || ''} onChange={e => handleEditChange('amount', parseFloat(e.target.value) || 0)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md py-1 px-2" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)]">Data</label>
              <input type="date" value={parsedTransaction.date} onChange={e => handleEditChange('date', e.target.value)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md py-1 px-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)]">Categoria</label>
              <select value={parsedTransaction.category} onChange={e => handleEditChange('category', e.target.value)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md py-1 px-2">
                {expenseCategoryList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)]">Subcategoria</label>
              <select value={parsedTransaction.subcategory} onChange={e => handleEditChange('subcategory', e.target.value)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md py-1 px-2">
                {categories[parsedTransaction.category]?.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)]">Nº de Parcelas</label>
              <input type="number" value={parsedTransaction.installments} min="1" onChange={e => handleEditChange('installments', parseInt(e.target.value) || 1)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md py-1 px-2" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)]">Método de Pagamento</label>
              <select value={parsedTransaction.paymentMethod} onChange={e => handleEditChange('paymentMethod', e.target.value as PaymentMethod)} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md py-1 px-2">
                {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (parsedTransaction) {
      const isInstallment = parsedTransaction.installments > 1;
      const installmentAmount = isInstallment ? parsedTransaction.amount / parsedTransaction.installments : parsedTransaction.amount;
      return (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-medium text-[var(--color-text)]">Confirme os detalhes:</h3>
          <div className="p-4 bg-[var(--surface)] rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-text-muted)]">Descrição</span>
              <span className="font-semibold text-[var(--color-text)]">{parsedTransaction.description}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-text-muted)]">Valor</span>
              <div className="text-right">
                <span className="font-bold text-expense">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsedTransaction.amount)}
                  {isInstallment && ` (Total)`}
                </span>
                {isInstallment && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {parsedTransaction.installments}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentAmount)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-text-muted)]">Data da Compra</span>
              <span className="font-semibold text-[var(--color-text)]">{new Date(parsedTransaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-text-muted)]">Categoria</span>
              {categoryInfo && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]`}>
                  <i className={`fas ${categoryInfo.icon} mr-1`}></i>
                  {parsedTransaction.category} {'>'} {parsedTransaction.subcategory}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-text-muted)]">Pagamento</span>
              {paymentInfo && (
                <span className={`text-xs font-medium flex items-center ${paymentInfo.color}`}>
                  <i className={`fas ${paymentInfo.icon} mr-1`}></i>
                  {parsedTransaction.paymentMethod}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <label htmlFor="quick-add-input" className="block text-sm font-medium text-[var(--color-text)]">
          O que você pagou? (Ex: Tênis 600 em 6x no crédito)
        </label>
        <input
          type="text"
          id="quick-add-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ex: cinema 45 reais no crédito dia 15"
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          disabled={isProcessing}
          autoFocus
        />
        {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--overlay)] z-50 flex justify-center items-center p-4">
      <div className="bg-[var(--card)] rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transition-all duration-300">
        <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--color-text)]">{initialMode === 'manual' && isEditing ? 'Lançar Pagamento Manual' : 'Lançamento Rápido'}</h2>
          <button onClick={handleClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {renderContent()}
        </div>

        <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--color-text)] bg-[var(--surface)] hover:bg-[color-mix(in oklab, var(--surface) 85%, black)] border border-[var(--border)] transition-colors"
          >
            Cancelar
          </button>

          {!parsedTransaction ? (
            <button
              onClick={handleProcessInput}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[color-mix(in oklab, var(--primary) 60%, transparent)] disabled:cursor-not-allowed transition-colors w-32"
            >
              {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : 'Analisar Gasto'}
            </button>
          ) : isEditing ? (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors"
            >
              Salvar
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium rounded-md text-[var(--color-text)] bg-[var(--surface)] hover:bg-[color-mix(in oklab, var(--surface) 85%, black)] border border-[var(--border)] transition-colors"
              >
                <i className="fas fa-pencil-alt mr-2"></i>Editar
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Confirmar e Adicionar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
