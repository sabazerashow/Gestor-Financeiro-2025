import { useState } from 'react';
import { Transaction, PaymentMethod } from '../types';
import { generateContent, generateDeepSeekContent, cleanJsonString } from '../lib/aiClient';
import { categories } from '../categories';

function normalizeText(text: string) {
    return (text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function inferPaymentMethodFromText(text: string): PaymentMethod | null {
    const normalized = normalizeText(text);

    const hasWord = (word: string) => new RegExp(`\\b${word}\\b`, 'i').test(normalized);

    if (hasWord('credito') || hasWord('cartao') || hasWord('cartao-de-credito') || hasWord('visa') || hasWord('master') || hasWord('elo')) return PaymentMethod.CREDITO;
    if (hasWord('debito')) return PaymentMethod.DEBITO;
    if (hasWord('pix')) return PaymentMethod.PIX;
    if (hasWord('dinheiro')) return PaymentMethod.DINHEIRO;

    return null;
}

function mapPaymentMethodFromSuggestion(value: unknown): PaymentMethod | null {
    if (typeof value !== 'string') return null;
    const normalized = normalizeText(value);

    if (!normalized) return null;
    if (normalized === 'outro' || normalized === 'other' || normalized === 'nenhum' || normalized === 'null') return null;

    if (normalized.includes('credito')) return PaymentMethod.CREDITO;
    if (normalized.includes('debito')) return PaymentMethod.DEBITO;
    if (normalized.includes('pix')) return PaymentMethod.PIX;
    if (normalized.includes('dinheiro')) return PaymentMethod.DINHEIRO;

    const validMethods = Object.values(PaymentMethod);
    if (validMethods.includes(value as PaymentMethod) && value !== PaymentMethod.OUTRO) return value as PaymentMethod;

    return null;
}

export function useAIAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number } | null>(null);
    const [analyzingTransactionId, setAnalyzingTransactionId] = useState<string | null>(null);


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
                setAnalyzingTransactionId(t.id);
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
1. Use a descrição bruta para identificar o método (considere variações sem acento: 'credito', 'debito', 'cartao').
2. Se houver termos como 'crédito/credito', retorne "Crédito".
3. Se houver 'débito/debito', retorne "Débito".
4. Se houver 'pix', retorne "PIX". Se houver 'dinheiro', retorne "Dinheiro".
5. Retorne exatamente um destes valores: "PIX", "Débito", "Crédito", "Dinheiro", ou null.`;

                    const glmMessages = [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Descrição Bruta: "${t.description}"\nLista de Categorias:\n${availableCategories}` }
                    ];

                    let suggestion: { category?: string; subcategory?: string; clean_description?: string; payment_method?: string | null } = {};

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

                        const paymentFromRaw = inferPaymentMethodFromText(t.description);
                        const paymentFromSuggestion = mapPaymentMethodFromSuggestion(suggestion.payment_method);
                        const paymentMethod = paymentFromRaw || paymentFromSuggestion;
                        if (paymentMethod) updates.paymentMethod = paymentMethod;

                        updateTransaction(t.id, updates);
                    }
                } catch (err) {
                    console.error(`Erro ao analisar transação ${t.id}:`, err);
                } finally {
                    setAnalysisProgress({ current: i + 1, total });
                    setAnalyzingTransactionId(null);
                }
            }
        } catch (err) {
            setAnalysisError("Ocorreu um erro durante a análise inteligente.");
        } finally {
            setIsAnalyzing(false);
            setAnalysisProgress(null);
            setAnalyzingTransactionId(null);
        }
    };

    return { analyzeTransactions, isAnalyzing, analysisError, analysisProgress, analyzingTransactionId, setAnalysisError };
}
