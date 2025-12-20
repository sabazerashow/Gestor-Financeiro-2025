import React, { useEffect, useMemo, useState } from 'react';
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

const severityClass: Record<InsightCard['severity'], string> = {
  ok: 'border-green-300 bg-green-50 text-green-800',
  atencao: 'border-yellow-300 bg-yellow-50 text-yellow-800',
  alerta: 'border-red-300 bg-red-50 text-red-800',
};

export default function IntelligentAnalysisCards({ transactions }: IntelligentAnalysisCardsProps) {
  const [cards, setCards] = useState<InsightCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compactar dados para a IA (mantendo foco em IA fazer o raciocínio)
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
      // Pequena validação
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
      <div className="text-sm text-[var(--color-text-muted)]">Adicione transações para ver análises inteligentes.</div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
            <i className="fas fa-wand-magic-sparkles"></i>
          </div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Análise IA</h3>
        </div>

        <button
          onClick={requestAI}
          disabled={loading}
          className="px-4 py-2 text-[10px] font-black rounded-xl bg-gray-50 text-gray-500 hover:bg-[var(--primary)] hover:text-white transition-all disabled:opacity-50 uppercase tracking-widest border border-gray-100"
        >
          {loading ? <i className="fas fa-spinner animate-spin"></i> : 'Atualizar'}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-lg font-medium">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.length === 0 && !loading && (
          <div className="text-sm text-gray-400 italic text-center col-span-2 py-4">Nenhum insight disponível no momento.</div>
        )}

        {cards.map((c, idx) => (
          <div key={idx} className={`rounded-2xl border p-5 ${severityClass[c.severity]}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm tracking-tight">{c.title}</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{c.severity}</span>
            </div>
            <p className="text-xs font-medium leading-relaxed opacity-90">{c.message}</p>
            {c.actionLabel && (
              <button
                className="mt-4 text-xs font-black uppercase tracking-wide opacity-80 hover:opacity-100 hover:underline"
                title={c.actionTarget || ''}
                onClick={() => {
                  const el = document.querySelector('h2.text-xl.font-bold:text-[var(--color-text)]');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {c.actionLabel} &rarr;
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
