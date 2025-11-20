import React, { useState, useEffect } from 'react';
import { generateContent } from '@/lib/aiClient';
import { GroupedTransaction, Transaction, TransactionType } from '../types';
import { categories, expenseCategoryList } from '../categories';

interface ImportNFeModalProps {
  isOpen: boolean;
  onClose: () => void;
  xmlContent: string | null;
  onConfirm: (transactions: Omit<Transaction, 'id'>[]) => void;
}

const cleanJsonString = (str: string) => str.replace(/```json/g, '').replace(/```/g, '').trim();

// This interface is slightly different from types.ts GroupedTransaction
// as it contains subcategory, which is then used to create the final transaction.
interface AIGroupedTransaction {
    category: string;
    subcategory: string;
    totalAmount: number;
    items: string[];
    description: string;
}

const ImportNFeModal: React.FC<ImportNFeModalProps> = ({ isOpen, onClose, xmlContent, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupedTransactions, setGroupedTransactions] = useState<AIGroupedTransaction[]>([]);
  const [issuer, setIssuer] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && xmlContent) {
      processXmlContent(xmlContent);
    } else {
        // Reset state when modal is closed or content is null
        setGroupedTransactions([]);
        setError(null);
        setIsLoading(false);
        setIssuer(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, xmlContent]);

  const processXmlContent = async (xml: string) => {
    setIsLoading(true);
    setError(null);
    setGroupedTransactions([]);

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'application/xml');
      
      const errorNode = xmlDoc.querySelector('parsererror');
      if (errorNode) {
        throw new Error('Erro ao analisar o arquivo XML. Verifique o formato do arquivo.');
      }

      const issuerName = xmlDoc.querySelector('emit xNome')?.textContent;
      setIssuer(issuerName);

      const items = Array.from(xmlDoc.querySelectorAll('det')).map(det => {
        const description = det.querySelector('prod xProd')?.textContent || 'Item sem descrição';
        const amount = parseFloat(det.querySelector('prod vProd')?.textContent || '0');
        return { description, amount };
      });

      if (items.length === 0) {
        throw new Error('Nenhum item encontrado na nota fiscal.');
      }
      
      const availableCategories = JSON.stringify(
          Object.fromEntries(
              expenseCategoryList.map(catName => [catName, categories[catName].subcategories])
          ), null, 2
      );
      
      const prompt = `Analise esta lista de itens de uma nota fiscal. Para cada item, atribua a categoria e subcategoria mais apropriada da estrutura fornecida.
Depois, agrupe os itens por categoria/subcategoria, some os valores totais de cada grupo e forneça um nome de transação geral para cada grupo. Responda em formato JSON.

Estrutura de Categorias de Despesa:
${availableCategories}

Itens:
${items.map(item => `- ${item.description}: R$ ${item.amount.toFixed(2)}`).join('\n')}

O nome do emissor da nota é: "${issuerName || 'Não identificado'}"
`;

      const response = await generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        expectJson: true,
      });
      
      const parsedResponse = JSON.parse(cleanJsonString(response.text)) as AIGroupedTransaction[];
      setGroupedTransactions(parsedResponse);

    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro desconhecido.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    const newTransactions = groupedTransactions.map(group => ({
      description: group.description,
      amount: group.totalAmount,
      type: TransactionType.EXPENSE,
      date: new Date().toISOString().split('T')[0],
      category: group.category,
      subcategory: group.subcategory,
    }));
    onConfirm(newTransactions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Importar Transações da Nota Fiscal</h2>
          {issuer && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">De: {issuer}</p>}
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center h-full">
              <i className="fas fa-spinner fa-spin text-4xl text-indigo-500"></i>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Analisando nota e sugerindo categorias...</p>
            </div>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!isLoading && !error && groupedTransactions.length > 0 && (
            <ul className="space-y-3">
              {groupedTransactions.map((group, index) => {
                const categoryInfo = categories[group.category];
                return (
                  <li key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{group.description}</p>
                    <div className="flex items-center justify-between mt-2">
                        <div>
                            {categoryInfo && (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]`}>
                                <i className={`fas ${categoryInfo.icon} mr-1`}></i>
                                {group.category} {'>'} {group.subcategory}
                                </span>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{group.items.join(', ')}</p>
                        </div>
                        <span className="font-bold text-expense">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(group.totalAmount)}
                        </span>
                    </div>
                  </li>
                );
              })}
            </ul>
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
            disabled={isLoading || error !== null || groupedTransactions.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--primary)]/50 disabled:cursor-not-allowed transition-colors"
          >
            Adicionar Transações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportNFeModal;
