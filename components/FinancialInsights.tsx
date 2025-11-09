

import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Transaction, TransactionType } from '../types';

interface FinancialInsightsProps {
  transactions: Transaction[];
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const renderMarkdownBold = (text: string) => {
    if (!text) return null;
    const parts = text.split('**');
    return parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    );
};

const FinancialInsights: React.FC<FinancialInsightsProps> = ({ transactions }) => {
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [analysisHasRun, setAnalysisHasRun] = useState(false);

  const generateInsights = useCallback(async () => {
    if (transactions.length < 3) {
      setError('São necessárias pelo menos 3 transações no período para gerar uma análise.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setInsights('');
    setIsExpanded(false);

    try {
      const transactionSummary = transactions
        .map(t => `Data: ${t.date}, Descrição: ${t.description}, Valor: R$ ${t.amount.toFixed(2)} (${t.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}), Categoria: ${t.category || 'N/A'}`)
        .join('\n');

      const prompt = `Você é um analista financeiro. Com base na lista de transações a seguir, forneça uma análise sobre os padrões de gastos e tendências.

**Formato da Resposta:**
1.  **Resumo (1 parágrafo):** Comece com um parágrafo curto e direto resumindo a saúde financeira do período. Use **negrito** para destacar valores ou pontos importantes.
2.  **Análise Detalhada (Tópicos):** Após o resumo, use uma linha em branco e depois forneça uma análise detalhada em formato de tópicos (bullet points). Identifique as 3 principais categorias de despesas, aponte transações incomuns ou de valor elevado, compare despesas com receitas e finalize com uma sugestão prática para melhorar a saúde financeira. Use **negrito** para os títulos dos tópicos (ex: ****Principais Despesas:** **).

**Transações:**
${transactionSummary}

Responda em português do Brasil, usando markdown para os tópicos (* para bullet points, ** para negrito).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setInsights(response.text);
      setAnalysisHasRun(true);
    } catch (e) {
      console.error("Erro ao gerar insights:", e);
      setError('Não foi possível gerar a análise no momento. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [transactions]);
  
  const summary = React.useMemo(() => {
    if (!insights) return '';
    const firstParagraph = insights.split('\n\n')[0];
    return firstParagraph;
  }, [insights]);

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Analisando seus padrões de gastos...</span>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (insights) {
        return (
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
                <div className={`prose prose-sm dark:prose-invert max-w-none transition-all duration-300 ${isExpanded ? 'max-h-full' : 'max-h-40 overflow-hidden'}`}>
                    {isExpanded ? (
                        insights.split('\n\n').map((paragraph, pIndex) => (
                            <div key={pIndex}>
                                {paragraph.split('\n').map((line, lIndex) => (
                                    <p key={lIndex} className="text-sm">
                                        {renderMarkdownBold(line.startsWith('* ') ? `• ${line.substring(2)}` : line)}
                                    </p>
                                ))}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm">{renderMarkdownBold(summary)}</p>
                    )}
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold mt-2">
                    {isExpanded ? 'Mostrar menos' : 'Ver análise completa'}
                </button>
            </div>
        );
    }

    return (
        <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Obtenha insights automáticos sobre seus gastos no período selecionado.</p>
        </div>
    );
  };

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Análise Inteligente</h2>
            <button
                onClick={generateInsights}
                disabled={isLoading}
                className="px-3 py-1 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
                <span>{analysisHasRun ? 'Atualizar' : 'Gerar Análise'}</span>
            </button>
        </div>
      
      {renderContent()}
    </div>
  );
};

export default FinancialInsights;