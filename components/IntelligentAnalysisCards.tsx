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
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold text-[var(--color-text)]">Análises Inteligentes (IA)</h3>
        <button
          onClick={requestAI}
          disabled={loading}
          className="px-3 py-1 text-sm rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]/60 disabled:opacity-50"
        >
          {loading ? 'Gerando…' : 'Atualizar'}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 mb-2">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cards.length === 0 && !loading && (
          <div className="text-sm text-[var(--color-text-muted)]">Nenhum insight disponível no momento.</div>
        )}

        {cards.map((c, idx) => (
          <div key={idx} className={`rounded-lg border p-4 ${severityClass[c.severity]}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{c.title}</span>
              <span className="text-xs uppercase tracking-wide">{c.severity}</span>
            </div>
            <p className="text-sm">{c.message}</p>
            {c.actionLabel && (
              <button
                className="mt-3 text-xs font-semibold text-[var(--primary)] hover:underline"
                title={c.actionTarget || ''}
                onClick={() => {
                  // Por ora, apenas rolar até a seção de análises de IA existente
                  const el = document.querySelector('h2.text-xl.font-bold:text-[var(--color-text)]');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {c.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
