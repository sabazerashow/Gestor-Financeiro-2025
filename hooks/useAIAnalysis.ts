import { useState } from 'react';
import { Transaction } from '../types';
import { generateContent, generateGLMContent } from '../lib/aiClient';
import { categories } from '../categories';

export function useAIAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const cleanJsonString = (s: string) => s.replace(/```json/g, '').replace(/```/g, '').trim();

    const analyzeTransactions = async (
        transactions: Transaction[],
        updateTransaction: (id: string, updates: Partial<Transaction>) => void
    ) => {
        try {
            setIsAnalyzing(true);
            setAnalysisError(null);

            const pending = transactions.filter(t => t.category === 'A verificar');
            if (pending.length === 0) {
                setAnalysisError("Nenhum registro marcado como 'A verificar' para analisar.");
                return;
            }

            const availableCategories = JSON.stringify(
                Object.fromEntries(
                    Object.keys(categories)
                        .filter(catName => catName !== 'Receitas/Entradas')
                        .map(catName => [catName, categories[catName].subcategories])
                ), null, 2
            );

            for (const t of pending) {
                try {
                    const glmMessages = [
                        { role: 'system', content: 'Você é um classificador de despesas pessoais. Responda apenas com JSON: {"category":"...","subcategory":"..."} usando uma categoria e subcategoria presentes na estrutura fornecida.' },
                        { role: 'user', content: `Descrição: ${t.description}\nEstrutura:\n${availableCategories}` }
                    ];

                    let suggestion: { category?: string; subcategory?: string } = {};

                    try {
                        const glmResp = await generateGLMContent({ model: 'glm-4', messages: glmMessages, temperature: 0.1 });
                        const glmText = glmResp?.choices?.[0]?.message?.content || '';
                        suggestion = JSON.parse(cleanJsonString(glmText));
                    } catch (e) {
                        // Fallback to Gemini
                        const prompt = `Dada a descrição: "${t.description}", sugira categoria/subcategoria em JSON.\nEstrutura:\n${availableCategories}`;
                        const geminiResp = await generateContent({ model: 'gemini-1.5-flash', contents: prompt, expectJson: true });
                        suggestion = JSON.parse(cleanJsonString(geminiResp.text));
                    }

                    if (suggestion.category && categories[suggestion.category]) {
                        const chosenSub = suggestion.subcategory && categories[suggestion.category].subcategories.includes(suggestion.subcategory)
                            ? suggestion.subcategory
                            : categories[suggestion.category].subcategories[0];

                        updateTransaction(t.id, {
                            category: suggestion.category,
                            subcategory: chosenSub
                        });
                    }
                } catch (err) {
                    console.error(`Erro ao analisar transação ${t.id}:`, err);
                }
            }
        } catch (err) {
            setAnalysisError("Ocorreu um erro durante a análise inteligente.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return { analyzeTransactions, isAnalyzing, analysisError, setAnalysisError };
}
