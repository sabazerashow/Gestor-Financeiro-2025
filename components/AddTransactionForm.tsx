

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { categories, expenseCategoryList, incomeCategoryList } from '../categories';
import { GoogleGenAI } from '@google/genai';
import { Input } from './ui/input';
import { Button } from './ui/button';
import ErrorBanner from './ui/error-banner';

function useDebounce(callback: (...args: any[]) => void, delay: number) {
  const timeoutRef = useRef<number | null>(null);

  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const cleanJsonString = (str: string) => str.replace(/```json/g, '').replace(/```/g, '').trim();

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>, installmentCount?: number) => void;
  onFileSelected: (file: { content: string; mimeType: string }, type: 'nfe' | 'statement' | 'bp') => void;
  onExportClick: () => void;
  onCSVFileSelected: (csvContent: string) => void;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onAddTransaction, onFileSelected, onExportClick, onCSVFileSelected }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDITO);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState('');
  const [error, setError] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const importTypeRef = useRef<'nfe' | 'statement' | 'bp'>('nfe');
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limite para uploads gerais
  const MAX_CSV_SIZE = 2 * 1024 * 1024; // 2MB para CSV

  const getCategorySuggestion = async (text: string) => {
    if (text.trim().length < 5) return;

    setIsSuggesting(true);
    try {
      const availableCategories = JSON.stringify(
          Object.fromEntries(
              expenseCategoryList.map(catName => [catName, categories[catName].subcategories])
          ), null, 2
      );
      const prompt = `Dada a descrição de uma transação: "${text}", sugira a categoria e subcategoria mais apropriada.
      Responda APENAS com um objeto JSON contendo "category" e "subcategory".
      Estrutura de categorias de despesa disponível:
      ${availableCategories}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const suggestion = JSON.parse(cleanJsonString(response.text));
      
      if (suggestion.category && expenseCategoryList.includes(suggestion.category)) {
        setCategory(suggestion.category);
        if (suggestion.subcategory && categories[suggestion.category]?.subcategories.includes(suggestion.subcategory)) {
            setSubcategory(suggestion.subcategory);
        } else {
            setSubcategory(categories[suggestion.category].subcategories[0]);
        }
      }

    } catch (e) {
      console.error("Erro ao sugerir categoria:", e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const debouncedSuggestCategory = useDebounce(getCategorySuggestion, 1000);

  useEffect(() => {
    if (type === TransactionType.EXPENSE) {
      debouncedSuggestCategory(description);
    }
  }, [description, type, debouncedSuggestCategory]);

  useEffect(() => {
    // Reset category/subcategory when type changes
    setCategory('');
    setSubcategory('');
  }, [type]);

  useEffect(() => {
    // When category changes, reset subcategory and set a default if possible
    if (category && categories[category]) {
      setSubcategory(categories[category].subcategories[0]);
    } else {
      setSubcategory('');
    }
  }, [category]);

  useEffect(() => {
    if (!isInstallment) {
      setInstallments('');
    }
    if (isInstallment && type === TransactionType.EXPENSE) {
        setPaymentMethod(PaymentMethod.CREDITO);
    }
  }, [isInstallment, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!description || !amount || !category || !subcategory || !date) {
      setError('Todos os campos são obrigatórios.');
      setIsSubmitting(false);
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, insira um valor numérico positivo.');
      setIsSubmitting(false);
      return;
    }
    const installmentCount = isInstallment ? parseInt(installments, 10) : undefined;
    if (isInstallment && (!installmentCount || installmentCount <= 1)) {
        setError('O número de parcelas deve ser maior que 1.');
        setIsSubmitting(false);
        return;
    }

    onAddTransaction({
      description,
      amount: numericAmount,
      type,
      date: date,
      category,
      subcategory,
      paymentMethod,
    }, installmentCount);

    // Reset form
    setDescription('');
    setAmount('');
    setError('');
    setCategory('');
    setSubcategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setType(TransactionType.EXPENSE);
    setPaymentMethod(PaymentMethod.CREDITO);
    setIsInstallment(false);
    setInstallments('');
    setIsSubmitting(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Tamanho máximo
      if (file.size > MAX_FILE_SIZE) {
        setError('O arquivo selecionado excede o limite de 5 MB.');
        if (event.target) event.target.value = '';
        return;
      }

      // Validação de tipo (mimetype/ extensão)
      const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];
      const allowedDocTypes = ['application/xml', 'text/xml', 'application/pdf'];
      const lowerName = file.name.toLowerCase();
      const isXml = lowerName.endsWith('.xml');
      const isPdf = lowerName.endsWith('.pdf');
      const isImage = allowedImageTypes.includes(file.type);
      const isValid = isImage || allowedDocTypes.includes(file.type) || isXml || isPdf;
      if (!isValid) {
        setError('Formato de arquivo não suportado. Permitidos: XML, PDF, PNG, JPEG, WEBP.');
        if (event.target) event.target.value = '';
        return;
      }

      const reader = new FileReader();
      const mimeType = file.type;

      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          onFileSelected({ content, mimeType }, importTypeRef.current);
        }
      };
      
      if (mimeType.startsWith('image/')) {
        reader.readAsDataURL(file); // Reads as Base64 Data URL
      } else {
        reader.readAsText(file, 'ISO-8859-1'); // For XML, OFX, text from PDF
      }
    }
     // Reset file input to allow selecting the same file again
    event.target.value = '';
  };
  
  const handleCSVFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const lowerName = file.name.toLowerCase();
      const isCsv = lowerName.endsWith('.csv') || file.type === 'text/csv';
      if (!isCsv) {
        setError('Formato inválido. Selecione um arquivo CSV.');
        if (event.target) event.target.value = '';
        return;
      }

      if (file.size > MAX_CSV_SIZE) {
        setError('O arquivo CSV excede o limite de 2 MB.');
        if (event.target) event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          onCSVFileSelected(content);
        }
      };
      reader.readAsText(file);
    }
    if (event.target) {
        event.target.value = ''; // Reset
    }
  };


  const handleImportClick = (type: 'nfe' | 'statement' | 'bp') => {
    importTypeRef.current = type;
    fileInputRef.current?.click();
  };
  
  const currentCategoryList = type === TransactionType.INCOME ? incomeCategoryList : expenseCategoryList;


  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-transform hover:-translate-y-0.5 will-change-transform">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Adicionar Lançamento</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
          <Input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            placeholder="Ex: Jantar com amigos"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor {isInstallment ? 'Total' : ''} (R$)
            </label>
            <Input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
              placeholder="Ex: 80.00"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data {isInstallment ? 'da Compra' : ''}
            </label>
            <Input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                Categoria
                {isSuggesting && <i className="fas fa-spinner fa-spin ml-2"></i>}
            </label>
            <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                <option value="" disabled>Selecione</option>
                {currentCategoryList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            </div>
            <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subcategoria</label>
                <select
                    id="subcategory"
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Método de Pagamento
            </label>
            <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                {Object.values(PaymentMethod).map(method => (
                <option key={method} value={method}>{method}</option>
                ))}
            </select>
            </div>
             {isInstallment && (
                <div>
                    <label htmlFor="installments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nº de Parcelas</label>
                    <Input
                      type="number"
                      id="installments"
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      className="mt-1"
                      placeholder="Ex: 6"
                      min="2"
                    />
                </div>
            )}
        </div>
        
        <div className="flex justify-between items-center">
            <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</span>
            <div className="mt-2 flex space-x-4">
                <label className="flex items-center">
                <input
                    type="radio"
                    name="type"
                    value={TransactionType.INCOME}
                    checked={type === TransactionType.INCOME}
                    onChange={() => setType(TransactionType.INCOME)}
                    className="form-radio h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Receita</span>
                </label>
                <label className="flex items-center">
                <input
                    type="radio"
                    name="type"
                    value={TransactionType.EXPENSE}
                    checked={type === TransactionType.EXPENSE}
                    onChange={() => setType(TransactionType.EXPENSE)}
                    className="form-radio h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Despesa</span>
                </label>
            </div>
            </div>

            {type === TransactionType.EXPENSE && (
                <div className="flex items-center">
                    <input
                    id="is-installment"
                    type="checkbox"
                    checked={isInstallment}
                    onChange={(e) => setIsInstallment(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is-installment" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        É uma compra parcelada?
                    </label>
                </div>
            )}
        </div>

        {error && <ErrorBanner message={error} onClose={() => setError('')} />}
        <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </Button>

     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xml,.pdf,image/png,image/jpeg,image/webp" />
            <input type="file" ref={csvFileInputRef} onChange={handleCSVFileChange} className="hidden" accept=".csv" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                <Button variant="secondary" onClick={() => handleImportClick('nfe')} className="w-full transition-all hover:shadow-md hover:-translate-y-0.5 will-change-transform">
                    <i className="fas fa-file-invoice-dollar fa-fw mr-2"></i> Importar NF (XML)
                </Button>
                <Button variant="secondary" onClick={() => handleImportClick('statement')} className="w-full transition-all hover:shadow-md hover:-translate-y-0.5 will-change-transform">
                    <i className="fas fa-file-alt fa-fw mr-2"></i> Importar Extrato
                </Button>
                <Button variant="outline" onClick={onExportClick} className="w-full transition-all hover:shadow-md hover:-translate-y-0.5 will-change-transform">
                    <i className="fas fa-file-csv fa-fw mr-2"></i> Exportar (CSV)
                </Button>
                <Button variant="outline" onClick={() => csvFileInputRef.current?.click()} className="w-full transition-all hover:shadow-md hover:-translate-y-0.5 will-change-transform">
                    <i className="fas fa-file-import fa-fw mr-2"></i> Importar (CSV)
                </Button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionForm;
