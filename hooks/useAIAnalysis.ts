import { useState } from 'react';
import { Transaction, PaymentMethod } from '../types';
import { generateContent, generateDeepSeekContent, cleanJsonString } from '../lib/aiClient';
import { categories } from '../categories';

export function useAIAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);


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
                        { role: 'system', content: 'Você é um classificador de despesas pessoais. Responda apenas com JSON: {"category":"...","subcategory":"...", "clean_description": "...", "payment_method": "..."}. "clean_description": remova valores, datas e termos de pagamento, mantenha apenas o nome do estabelecimento/produto, Capitalizado. "payment_method": use um destes se identificar claramente: "PIX", "Débito", "Crédito", "Dinheiro", "Outro".' },
                        { role: 'user', content: `Descrição: ${t.description}\nEstrutura:\n${availableCategories}` }
                    ];

                    let suggestion: { category?: string; subcategory?: string; clean_description?: string; payment_method?: string } = {};

                    try {
                        const deepseekResp = await generateDeepSeekContent({ model: 'deepseek-chat', messages: glmMessages, temperature: 0.1 });
                        const deepseekText = deepseekResp?.choices?.[0]?.message?.content || '';
                        suggestion = JSON.parse(cleanJsonString(deepseekText));
                    } catch (e) {
                        // Fallback to Gemini
                        const prompt = `Dada a descrição: "${t.description}", sugira categoria/subcategoria, uma descrição limpa (clean_description) e método de pagamento (payment_method: PIX, Débito, Crédito, Dinheiro, Outro) em JSON.\nEstrutura:\n${availableCategories}`;
                        const geminiResp = await generateContent({ model: 'gemini-1.5-flash', contents: prompt, expectJson: true });
                        suggestion = JSON.parse(cleanJsonString(geminiResp.text));
                    }

                    if (suggestion.category && categories[suggestion.category]) {
                        const chosenSub = suggestion.subcategory && categories[suggestion.category].subcategories.includes(suggestion.subcategory)
                            ? suggestion.subcategory
                            : categories[suggestion.category].subcategories[0];

                        const updates: Partial<Transaction> = {
                            category: suggestion.category,
                            subcategory: chosenSub
                        };

                        if (suggestion.clean_description) {
                            updates.description = suggestion.clean_description;
                        }

                        if (suggestion.payment_method) {
                            // Validate against Enum
                            const validMethods = Object.values(PaymentMethod);
                            if (validMethods.includes(suggestion.payment_method as PaymentMethod)) {
                                updates.paymentMethod = suggestion.payment_method as PaymentMethod;
                            }
                        }

                        updateTransaction(t.id, updates);
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
