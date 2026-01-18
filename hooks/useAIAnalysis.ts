import { useState } from 'react';
import { Transaction, PaymentMethod } from '../types';
import { generateContent, generateDeepSeekContent, cleanJsonString } from '../lib/aiClient';
import { categories } from '../categories';

export function useAIAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number } | null>(null);


    const analyzeTransactions = async (
        transactions: Transaction[],
        updateTransaction: (id: string, updates: Partial<Transaction>) => void,
        scope: 'all' | 'pending' = 'pending'
    ) => {
        try {
            setIsAnalyzing(true);
            setAnalysisError(null);

            const transactionsToAnalyze = scope === 'all' 
                ? transactions 
                : transactions.filter(t => t.category === 'A verificar');

            if (transactionsToAnalyze.length === 0) {
                setAnalysisError(scope === 'pending' 
                    ? "Nenhum registro marcado como 'A verificar' para analisar." 
                    : "Nenhuma transação para analisar.");
                return;
            }

            const total = transactionsToAnalyze.length;
            setAnalysisProgress({ current: 0, total });

            const availableCategories = JSON.stringify(
                Object.fromEntries(
                    Object.keys(categories)
                        .filter(catName => catName !== 'Receitas/Entradas')
                        .map(catName => [catName, categories[catName].subcategories])
                ), null, 2
            );

            for (let i = 0; i < transactionsToAnalyze.length; i++) {
                const t = transactionsToAnalyze[i];
                try {
                    const systemPrompt = `Você é um assistente financeiro meticuloso. Sua tarefa é limpar e categorizar transações.
Analise a descrição bruta e retorne APENAS um JSON válido com:
{
  "category": "Categoria da lista fornecida",
  "subcategory": "Subcategoria da lista",
  "clean_description": "Descrição limpa e legível",
  "payment_method": "Método de pagamento identificado"
}

Regras para 'clean_description':
1. REMOVA valores monetários (ex: 108,00), datas e símbolos soltos.
2. REMOVA termos de pagamento como 'pix', 'crédito', 'débito', 'visa', 'master', 'elo'.
3. MANTENHA o nome do estabelecimento, produto ou serviço.
4. Capitalize como Título (Title Case).
5. Exemplo: '108,00 - telefone - vivo - crédito' -> 'Conta Vivo' ou 'Telefone Vivo'.

Regras para 'payment_method':
1. Procure termos como 'pix', 'débito', 'crédito', 'dinheiro'.
2. Mapeie para: "PIX", "Débito", "Crédito", "Dinheiro".
3. Se não encontrar, retorne null ou "Outro".`;

                    const glmMessages = [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Descrição Bruta: "${t.description}"\nLista de Categorias:\n${availableCategories}` }
                    ];

                    let suggestion: { category?: string; subcategory?: string; clean_description?: string; payment_method?: string } = {};

                    try {
                        const deepseekResp = await generateDeepSeekContent({ model: 'deepseek-chat', messages: glmMessages, temperature: 0.1 });
                        const deepseekText = deepseekResp?.choices?.[0]?.message?.content || '';
                        suggestion = JSON.parse(cleanJsonString(deepseekText));
                    } catch (e) {
                        // Fallback to Gemini
                        const prompt = `${systemPrompt}\n\nDescrição Bruta: "${t.description}"\nLista de Categorias:\n${availableCategories}`;
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
                } finally {
                    setAnalysisProgress({ current: i + 1, total });
                }
            }
        } catch (err) {
            setAnalysisError("Ocorreu um erro durante a análise inteligente.");
        } finally {
            setIsAnalyzing(false);
            setAnalysisProgress(null);
        }
    };

    return { analyzeTransactions, isAnalyzing, analysisError, analysisProgress, setAnalysisError };
}
