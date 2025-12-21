import React, { useState } from 'react';
import { generateDeepSeekContent, GLMRequest } from '../lib/aiClient';
import { Button } from './ui/button';

interface GLMAnalysisProps {
  transactions?: any[];
  categories?: any[];
  period?: string;
}

export default function GLMAnalysis({ transactions = [], categories = [], period }: GLMAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const generateAnalysis = async () => {
    setLoading(true);
    setError('');

    try {
      // Preparar dados para análise
      const transactionsSummary = transactions.reduce((acc, t) => {
        const category = categories.find(c => c.id === t.category_id)?.name || 'Sem categoria';
        if (!acc[category]) acc[category] = { count: 0, total: 0 };
        acc[category].count++;
        acc[category].total += t.amount;
        return acc;
      }, {} as Record<string, { count: number; total: number }>);

      const totalIncome = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = Math.abs(transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0));

      const prompt = `Analise os seguintes dados financeiros para o período ${period || 'atual'}:

Receita total: R$ ${totalIncome.toFixed(2)}
Despesa total: R$ ${totalExpense.toFixed(2)}
Saldo: R$ ${(totalIncome - totalExpense).toFixed(2)}

Transações por categoria:
${(Object.entries(transactionsSummary) as [string, { count: number; total: number }][]).map(([cat, data]) =>
        `- ${cat}: ${data.count} transações, total R$ ${data.total.toFixed(2)}`
      ).join('\n')}

Forneça uma análise financeira concisa com:
1. Principais insights sobre os gastos
2. Recomendações para economizar
3. Áreas de atenção

Responda em português de forma clara e objetiva.`;

      const request: GLMRequest = {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Você é um especialista em análise financeira pessoal.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      };

      const response = await generateDeepSeekContent(request);

      if (response.choices && response.choices.length > 0) {
        setAnalysis(response.choices[0].message.content);
      } else {
        setError('Resposta inválida da API GLM');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar análise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Análise Financeira com IA</h2>
        <Button
          onClick={generateAnalysis}
          disabled={loading || transactions.length === 0}
          title="Gerar análise financeira com IA"
        >
          {loading ? 'Analisando...' : 'Gerar Análise'}
        </Button>
      </div>

      {transactions.length === 0 && (
        <div className="text-gray-500 text-center py-4">
          Adicione transações para gerar uma análise financeira.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {analysis && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2">Análise Gerada:</h3>
          <div className="whitespace-pre-wrap text-gray-700">{analysis}</div>
        </div>
      )}
    </div>
  );
}
