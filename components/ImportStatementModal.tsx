import React, { useState, useEffect } from 'react';
import { generateContent } from '@/lib/aiClient';
import { Transaction, TransactionToReview, TransactionType, PaymentMethod } from '../types';
import { categories, expenseCategoryList } from '../categories';

interface ImportStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileContent: string | null;
  onConfirm: (transactions: Omit<Transaction, 'id'>[]) => void;
}

const cleanJsonString = (str: string) => str.replace(/```json/g, '').replace(/```/g, '').trim();

// A simple placeholder for parsing OFX/CSV. A robust solution would use a dedicated library.
const parseStatement = (content: string): { date: string, description: string, amount: number }[] => {
    // This is a mock parser. It assumes a simple CSV format: "date,description,amount"
    // For OFX, you would need a more complex XML parser.
    return content
        .split('\n')
        .slice(1) // skip header
        .map(line => {
            const [date, description, amount] = line.split(',');
            if (date && description && amount) {
                return { date, description, amount: parseFloat(amount) };
            }
            return null;
        })
        .filter(item => item && !isNaN(item.amount)) as { date: string, description: string, amount: number }[];
};


const ImportStatementModal: React.FC<ImportStatementModalProps> = ({ isOpen, onClose, fileContent, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionsToReview, setTransactionsToReview] = useState<TransactionToReview[]>([]);
  
  const paymentMethods = Object.values(PaymentMethod);

  useEffect(() => {
    if (isOpen && fileContent) {
      processFileContent(fileContent);
    } else {
      setTransactionsToReview([]);
      setError(null);
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, fileContent]);
  
  const processFileContent = async (content: string) => {
    setIsLoading(true);
    setError(null);
    setTransactionsToReview([]);

    try {
        // NOTE: A real app would need a more robust parser for OFX and different CSV formats.
        const rawTransactions = parseStatement(content);

        if (rawTransactions.length === 0) {
            throw new Error('Nenhuma transação válida encontrada no arquivo. Verifique o formato (data,descrição,valor).');
        }

         const availableCategories = JSON.stringify(
            Object.fromEntries(
                expenseCategoryList.map(catName => [catName, categories[catName].subcategories])
            ), null, 2
        );

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                subcategory: { type: Type.STRING },
                paymentMethod: { type: Type.STRING },
            },
            required: ['description', 'category', 'subcategory', 'paymentMethod'],
        };

        // Batch processing would be more efficient for many transactions, but this sequential approach is simpler to implement.
        const enrichedTransactions: TransactionToReview[] = [];
        for (const raw of rawTransactions) {
            // Process only expenses for now
            if(raw.amount >= 0) continue;

             const prompt = `Analise a seguinte transação de extrato bancário.
                Descrição original: "${raw.description}"
                Métodos de pagamento disponíveis: ${paymentMethods.join(', ')}
                Estrutura de categorias de despesa disponível: ${availableCategories}

                Extraia uma descrição limpa, a categoria, a subcategoria e o método de pagamento mais prováveis.
                Responda APENAS com um objeto JSON.`;

            const response = await generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                expectJson: true,
            });

            const parsed = JSON.parse(cleanJsonString(response.text));
            
            const isValidCategory = expenseCategoryList.includes(parsed.category) && categories[parsed.category]?.subcategories.includes(parsed.subcategory);

            enrichedTransactions.push({
                originalDescription: raw.description,
                description: parsed.description,
                amount: Math.abs(raw.amount),
                date: new Date(raw.date).toISOString().split('T')[0],
                category: isValidCategory ? parsed.category : 'Outros',
                subcategory: isValidCategory ? parsed.subcategory : 'Presentes',
                paymentMethod: paymentMethods.includes(parsed.paymentMethod) ? parsed.paymentMethod : PaymentMethod.DEBITO,
            });
        }

        setTransactionsToReview(enrichedTransactions);

    } catch (e: any) {
        setError(e.message || 'Ocorreu um erro desconhecido ao processar o arquivo.');
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleConfirm = () => {
    const newTransactions = transactionsToReview.map(t => ({
      description: t.description,
      amount: t.amount,
      type: TransactionType.EXPENSE,
      date: t.date,
      category: t.category,
      subcategory: t.subcategory,
      paymentMethod: t.paymentMethod,
    }));
    onConfirm(newTransactions);
    onClose();
  };

  const handleItemChange = (index: number, field: 'category' | 'subcategory', value: string) => {
    const updated = [...transactionsToReview];
    const item = updated[index];
    item[field] = value;
    // If category changed, reset subcategory to the first available option
    if (field === 'category') {
        item.subcategory = categories[value]?.subcategories[0] || '';
    }
    setTransactionsToReview(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Revisar Transações do Extrato</h2>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center h-full">
              <i className="fas fa-spinner fa-spin text-4xl text-indigo-500"></i>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Analisando extrato e categorizando despesas...</p>
            </div>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!isLoading && !error && transactionsToReview.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ajuste as categorias conforme necessário antes de importar.</p>
              <ul className="space-y-2">
                {transactionsToReview.map((t, index) => (
                  <li key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="md:col-span-2">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{t.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate" title={t.originalDescription}>{t.originalDescription}</p>
                    </div>
                    <div className="flex items-center justify-between">
                         <span className="font-bold text-red-500 text-lg md:text-base">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </span>
                    </div>
                    <div>
                         <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div>
                        <select
                            value={t.category}
                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                            {expenseCategoryList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <select
                            value={t.subcategory}
                            onChange={(e) => handleItemChange(index, 'subcategory', e.target.value)}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                            {categories[t.category]?.subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || error !== null || transactionsToReview.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar e Importar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportStatementModal;
