import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
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

// Initialize AI client only if an API key is available (supports Vite and Node envs)
const resolvedApiKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GOOGLE_API_KEY) || (process.env as any)?.API_KEY;
const ai = resolvedApiKey ? new GoogleGenAI({ apiKey: resolvedApiKey }) : null;
const cleanJsonString = (str: string) => str.replace(/```json/g, '').replace(/```/g, '').trim();

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
    
    const availableCategories = JSON.stringify(
      Object.fromEntries(
        expenseCategoryList.map(catName => [catName, categories[catName].subcategories])
      ), null, 2
    );

    const today = new Date().toISOString().split('T')[0];

    // Lightweight local parser as fallback when AI is unavailable or fails
    const localParse = (text: string): ParsedTransaction | null => {
      const raw = text.toLowerCase();
      const amountMatch = raw.match(/(\d+[\.,]?\d*)\s*(reais|r\$|rs)?/);
      if (!amountMatch) return null;
      const amount = parseFloat(amountMatch[1].replace(/\./g, '').replace(',', '.'));
      const installmentsMatch = raw.match(/(\d+)\s*x/);
      const installments = installmentsMatch ? parseInt(installmentsMatch[1]) : 1;
      let paymentMethod: PaymentMethod = PaymentMethod.OUTRO;
      if (raw.includes('crédito') || raw.includes('cartao') || raw.includes('cartão')) paymentMethod = PaymentMethod.CREDITO;
      else if (raw.includes('débito') || raw.includes('debito')) paymentMethod = PaymentMethod.DEBITO;
      else if (raw.includes('pix')) paymentMethod = PaymentMethod.PIX;
      else if (raw.includes('dinheiro')) paymentMethod = PaymentMethod.DINHEIRO;
      else if (raw.includes('boleto')) paymentMethod = PaymentMethod.BOLETO;

      let category = 'Outros';
      let subcategory = 'Presentes';
      const map: Array<{k: RegExp, c: string, s: string}> = [
        { k: /(cinema|filme|movie)/, c: 'Lazer', s: 'Entretenimento' },
        { k: /(restaurante|jantar|almoço|ifood|delivery)/, c: 'Alimentação', s: 'Delivery/Apps' },
        { k: /(supermercado|mercado|compras)/, c: 'Alimentação', s: 'Supermercado/Compras' },
        { k: /(combustível|gasolina|posto)/, c: 'Transporte', s: 'Combustível/Manutenção' },
        { k: /(internet|luz|energia|conta)/, c: 'Casa/Moradia', s: 'Contas Domésticas' },
        { k: /(saúde|plano|consulta|médico)/, c: 'Saúde', s: 'Consultas/Médicos' },
      ];
      for (const m of map) { if (m.k.test(raw)) { category = m.c; subcategory = m.s; break; } }

      let date = today;
      const dayMatch = raw.match(/dia\s*(\d{1,2})/);
      if (dayMatch) {
        const d = new Date();
        d.setDate(parseInt(dayMatch[1]));
        date = d.toISOString().split('T')[0];
      } else if (raw.includes('ontem')) {
        const d = new Date(); d.setDate(d.getDate() - 1); date = d.toISOString().split('T')[0];
      } else if (raw.includes('hoje')) {
        date = today;
      }

      const description = text.trim();
      return { description, amount, category, subcategory, paymentMethod, date, installments };
    };

    const prompt = `Você é um assistente financeiro inteligente. Analise o texto a seguir e extraia os detalhes da transação.
    A data de hoje é ${today}.
    Texto de entrada: "${inputValue}"
    Métodos de pagamento disponíveis: ${paymentMethods.join(', ')}
    Estrutura de categorias de despesa disponível:
    ${availableCategories}
    
    Sua tarefa é extrair:
    - descrição: Uma descrição clara e concisa.
    - amount: O valor monetário TOTAL da compra (como um número).
    - category: A categoria principal mais apropriada da lista.
    - subcategory: A subcategoria mais apropriada dentro da categoria principal escolhida.
    - paymentMethod: O método de pagamento. Se não mencionado, assuma 'Crédito' se for parcelado, ou 'Débito' se for à vista.
    - date: A data da transação (formato YYYY-MM-DD). Se não mencionada, use a data de hoje (${today}).
    - installments: O número de parcelas. Se não houver menção, o número é 1.
    
    Responda APENAS com um objeto JSON válido.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            subcategory: { type: Type.STRING },
            paymentMethod: { type: Type.STRING },
            date: { type: Type.STRING },
            installments: { type: Type.NUMBER }
        },
        required: ['description', 'amount', 'category', 'subcategory', 'paymentMethod', 'date', 'installments']
    };

    try {
        if (!ai) {
            const parsed = localParse(inputValue);
            if (!parsed) throw new Error('local-parse-failed');
            setParsedTransaction(parsed);
            return;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            }
        });
        
        const parsedResponse = JSON.parse(cleanJsonString(response.text)) as ParsedTransaction;
        
        // Validation
        if (!expenseCategoryList.includes(parsedResponse.category) || !categories[parsedResponse.category]?.subcategories.includes(parsedResponse.subcategory)) {
             parsedResponse.category = 'Outros';
             parsedResponse.subcategory = 'Presentes';
        }
        if (!paymentMethods.includes(parsedResponse.paymentMethod)) {
            parsedResponse.paymentMethod = PaymentMethod.OUTRO;
        }

        setParsedTransaction(parsedResponse);
    } catch (e: any) {
        console.error(e);
        const parsed = localParse(inputValue);
        if (parsed) {
            setParsedTransaction(parsed);
        } else {
            setError("Não consegui entender o que você digitou. Tente ser mais específico, por exemplo: 'jantar 50 reais no crédito ontem'");
        }
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
                    <label className="text-xs text-gray-500">Descrição</label>
                    <input type="text" value={parsedTransaction.description} onChange={e => handleEditChange('description', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2"/>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500">Valor Total</label>
                        <input type="number" placeholder="0,00" value={parsedTransaction.amount || ''} onChange={e => handleEditChange('amount', parseFloat(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2"/>
                    </div>
                     <div>
                        <label className="text-xs text-gray-500">Data</label>
                        <input type="date" value={parsedTransaction.date} onChange={e => handleEditChange('date', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2"/>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500">Categoria</label>
                        <select value={parsedTransaction.category} onChange={e => handleEditChange('category', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2">
                            {expenseCategoryList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-xs text-gray-500">Subcategoria</label>
                        <select value={parsedTransaction.subcategory} onChange={e => handleEditChange('subcategory', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2">
                            {categories[parsedTransaction.category]?.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500">Nº de Parcelas</label>
                        <input type="number" value={parsedTransaction.installments} min="1" onChange={e => handleEditChange('installments', parseInt(e.target.value) || 1)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2"/>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Método de Pagamento</label>
                        <select value={parsedTransaction.paymentMethod} onChange={e => handleEditChange('paymentMethod', e.target.value as PaymentMethod)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2">
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
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Confirme os detalhes:</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Descrição</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{parsedTransaction.description}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Valor</span>
                        <div className="text-right">
                           <span className="font-bold text-red-500">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsedTransaction.amount)}
                                {isInstallment && ` (Total)`}
                            </span>
                            {isInstallment && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {parsedTransaction.installments}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentAmount)}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Data da Compra</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{new Date(parsedTransaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Categoria</span>
                        {categoryInfo && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${categoryInfo.color}`}>
                                <i className={`fas ${categoryInfo.icon} mr-1`}></i>
                                {parsedTransaction.category} {'>'} {parsedTransaction.subcategory}
                            </span>
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Pagamento</span>
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
            <label htmlFor="quick-add-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                O que você pagou? (Ex: Tênis 600 em 6x no crédito)
            </label>
            <input
                type="text"
                id="quick-add-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ex: cinema 45 reais no crédito dia 15"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-3 px-4 text-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isProcessing}
                autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transition-all duration-300">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{initialMode === 'manual' && isEditing ? 'Lançar Pagamento Manual' : 'Lançamento Rápido'}</h2>
           <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <i className="fas fa-times"></i>
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
            {renderContent()}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
            <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-colors"
            >
                Cancelar
            </button>
            
            {!parsedTransaction ? (
              <button
                onClick={handleProcessInput}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors w-32"
              >
                {isProcessing ? <i className="fas fa-spinner fa-spin"></i> : 'Analisar Gasto'}
              </button>
            ) : isEditing ? (
                 <button
                    onClick={handleConfirm}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    Salvar
                  </button>
            ) : (
                <div className="flex space-x-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-colors"
                    >
                        <i className="fas fa-pencil-alt mr-2"></i>Editar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
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
