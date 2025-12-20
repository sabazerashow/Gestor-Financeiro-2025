import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateGLMContent } from '../lib/aiClient';
import { Transaction, TransactionType } from '../types';

type InsightCard = {
  title: string;
  severity: 'ok' | 'atencao' | 'alerta';
  message: string;
  actionLabel?: string;
  actionTarget?: string;
};

interface IntelligentAnalysisCardsProps {
  transactions: Transaction[];
}

const severityConfig: Record<InsightCard['severity'], { bg: string; text: string; border: string; icon: string }> = {
  ok: { bg: 'bg-emerald-50/50', text: 'text-emerald-700', border: 'border-emerald-100', icon: 'fa-circle-check' },
  atencao: { bg: 'bg-amber-50/50', text: 'text-amber-700', border: 'border-amber-100', icon: 'fa-circle-exclamation' },
  alerta: { bg: 'bg-rose-50/50', text: 'text-rose-700', border: 'border-rose-100', icon: 'fa-triangle-exclamation' },
};

export default function IntelligentAnalysisCards({ transactions = [] }: IntelligentAnalysisCardsProps) {
  const [cards, setCards] = useState<InsightCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compactData = useMemo(() => {
    return transactions.map(t => ({
      date: t.date,
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      category: t.category || null,
      paymentMethod: t.paymentMethod || null,
    }));
  }, [transactions]);

  const periodLabel = useMemo(() => {
    if (!transactions.length) return 'período atual';
    const dates = transactions.map(t => new Date(t.date + 'T00:00:00')).sort((a, b) => a.getTime() - b.getTime());
    const start = dates[0].toLocaleDateString('pt-BR');
    const end = dates[dates.length - 1].toLocaleDateString('pt-BR');
    return `${start} a ${end}`;
  }, [transactions]);

  const requestAI = async () => {
    if (!compactData.length) return;
    setLoading(true);
    setError(null);
    try {
      const system = [
        'Você é um analista financeiro pessoal especialista em sintetizar insights breves.',
        'Receba uma lista de transações (descrição, valor, data, tipo, categoria quando houver) e gere 4 cards de análise.',
        'Cada card deve ter no máximo 220 caracteres na mensagem, sem parágrafos, sem listas.',
        'Retorne APENAS JSON válido, no formato: ',
        '[{"title":"…","severity":"ok|atencao|alerta","message":"…","actionLabel":"…","actionTarget":"route|cardId"}, …]'
      ].join(' ');

      const user = `Período: ${periodLabel}
Transações (${compactData.length}): ${JSON.stringify(compactData)}

Regras:
- Subgrupos: Previsão de Caixa, Tendências do Mês, Oportunidades de Economia, Poder de Compra.
- A IA deve identificar serviços de streaming por nome (ex.: Netflix, Prime Video, Disney+, Spotify, HBO Max, Apple TV+, YouTube Premium, Globoplay, Deezer, Paramount+).
- Calcule variações vs histórico (dentro do período recebido), identifique recorrências e gastos fora do padrão.
- Se faltar dados para um card, ainda assim produza um insight útil e curto.
- Apenas JSON; não explique.`;

      const response = await generateGLMContent({
        model: 'glm-4',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 800,
      });

      let content: string | undefined;
      if (response?.choices?.[0]?.message?.content) {
        content = response.choices[0].message.content;
      } else if (typeof response === 'string') {
        content = response as string;
      }

      if (!content) throw new Error('Resposta da IA vazia');

      const parsed = JSON.parse(content) as InsightCard[];
      const cleaned = parsed.slice(0, 4).map(c => ({
        title: c.title || 'Insight',
        severity: (c.severity === 'ok' || c.severity === 'atencao' || c.severity === 'alerta') ? c.severity : 'ok',
        message: (c.message || '').slice(0, 220),
        actionLabel: c.actionLabel || 'Ver detalhes',
        actionTarget: c.actionTarget || 'reports:financialInsights',
      }));
      setCards(cleaned);
    } catch (e) {
      console.error(e);
      setError('Não foi possível gerar os cards com IA agora.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestAI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compactData.length]);

  if (!transactions.length) {
    return (
      <div className="text-sm text-gray-400 font-medium italic p-10 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100 flex items-center justify-center">
        Adicione transações para ver análises inteligentes.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-full flex flex-col group"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-inner group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
            <i className="fas fa-wand-magic-sparkles text-sm"></i>
          </div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cérebro Financeiro (IA)</h3>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={requestAI}
          disabled={loading}
          className="px-4 py-2 text-[9px] font-black rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50 uppercase tracking-[0.1em] border border-gray-100"
        >
          {loading ? <i className="fas fa-spinner animate-spin"></i> : 'Recalcular'}
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-[11px] text-rose-500 mb-6 bg-rose-50 p-4 rounded-2xl font-bold border border-rose-100 flex items-center gap-2"
        >
          <i className="fas fa-circle-exclamation"></i>
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <AnimatePresence mode="popLayout">
          {cards.length === 0 && !loading ? (
            <div className="text-xs text-gray-400 italic text-center col-span-2 py-10 opacity-50">Nenhum insight disponível.</div>
          ) : (
            cards.map((c, idx) => {
              const config = severityConfig[c.severity];
              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-[1.5rem] border ${config.border} p-5 ${config.bg} transition-all duration-500 hover:shadow-lg hover:shadow-gray-200/50 flex flex-col`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-black text-[11px] tracking-tight ${config.text}`}>{c.title}</span>
                    <div className={`w-2 h-2 rounded-full ${c.severity === 'ok' ? 'bg-emerald-400' : c.severity === 'atencao' ? 'bg-amber-400' : 'bg-rose-400'}`}></div>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed text-gray-600 flex-grow">{c.message}</p>

                  {c.actionLabel && (
                    <button
                      className={`mt-4 text-[9px] font-black uppercase tracking-widest ${config.text} hover:underline w-fit`}
                      onClick={() => {
                        const el = document.querySelector('h2');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {c.actionLabel} &rarr;
                    </button>
                  )}
                </motion.div>
              );
            })
          )}
          {loading && (
            <div className="col-span-2 flex flex-col items-center justify-center py-10 gap-3 opacity-50">
              <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-600">IA Analisando...</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

