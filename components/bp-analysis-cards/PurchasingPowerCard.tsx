import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Payslip } from '../../types';
import PurchasingPowerChart from '../charts/PurchasingPowerChart';

interface PurchasingPowerCardProps {
  payslips: Payslip[];
}

const PurchasingPowerCard: React.FC<PurchasingPowerCardProps> = ({ payslips }) => {
  const [referenceDate, setReferenceDate] = useState<string>(''); // YYYY-MM
  const [analysisStartDate, setAnalysisStartDate] = useState<string>(''); // YYYY-MM
  const [analysisEndDate, setAnalysisEndDate] = useState<string>(''); // YYYY-MM
  const [purchasingPowerData, setPurchasingPowerData] = useState<{ labels: string[]; nominal: number[]; real: number[] } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [inflationSummary, setInflationSummary] = useState<string | null>(null);
  const [isInflationLoading, setIsInflationLoading] = useState(false);
  // Exportação de gráfico removida; referência ao chart não é mais necessária.

  // Set initial dates for purchasing power analysis based on available payslips
  useEffect(() => {
    if (payslips.length > 0) {
      const sorted = [...payslips].sort((a, b) => new Date(a.year, a.month - 1).getTime() - new Date(b.year, b.month - 1).getTime());
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      setAnalysisStartDate(`${first.year}-${String(first.month).padStart(2, '0')}`);
      setAnalysisEndDate(`${last.year}-${String(last.month).padStart(2, '0')}`);
      setReferenceDate(`${last.year}-${String(last.month).padStart(2, '0')}`);
    }
  }, [payslips]);

  // Comentário automático de inflação acumulada ao selecionar início e fim
  useEffect(() => {
    const fetchInflationSummary = async () => {
      if (!analysisStartDate || !analysisEndDate) { setInflationSummary(null); return; }
      try {
        setIsInflationLoading(true);
        setInflationSummary(null);
        const [startYear, startMonth] = analysisStartDate.split('-').map(Number);
        const [endYear, endMonth] = analysisEndDate.split('-').map(Number);

        const apiStartDate = `01/${startMonth}/${startYear}`;
        const lastDayOfEndMonth = new Date(endYear, endMonth, 0).getDate();
        const apiEndDate = `${lastDayOfEndMonth}/${endMonth}/${endYear}`;

        const response = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=${apiStartDate}&dataFinal=${apiEndDate}`);
        if (!response.ok) throw new Error('Falha ao buscar dados de inflação do Banco Central.');
        const ipcaRawData: { data: string; valor: string }[] = await response.json();
        if (ipcaRawData.length === 0) { setInflationSummary('Sem dados de inflação para o período selecionado.'); return; }

        // Calcular inflação acumulada (índice multiplicativo)
        let cumulativeIndex = 1;
        ipcaRawData.forEach(item => {
          const monthly = Number(item.valor) / 100;
          cumulativeIndex *= (1 + monthly);
        });
        const accumulated = (cumulativeIndex - 1) * 100;
        setInflationSummary(`Inflação acumulada no período: ${accumulated.toFixed(2)}%`);
      } catch (e) {
        setInflationSummary(null);
        console.warn(e);
      } finally {
        setIsInflationLoading(false);
      }
    };

    fetchInflationSummary();
  }, [analysisStartDate, analysisEndDate]);

  const handleGeneratePurchasingPowerChart = async () => {
    setIsCalculating(true);
    setCalculationError(null);
    setPurchasingPowerData(null);

    try {
      const [startYear, startMonth] = analysisStartDate.split('-').map(Number);
      const [endYear, endMonth] = analysisEndDate.split('-').map(Number);

      const apiStartDate = `01/${startMonth}/${startYear}`;
      const lastDayOfEndMonth = new Date(endYear, endMonth, 0).getDate();
      const apiEndDate = `${lastDayOfEndMonth}/${endMonth}/${endYear}`;

      const response = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json&dataInicial=${apiStartDate}&dataFinal=${apiEndDate}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar dados de inflação do Banco Central.');
      }
      const ipcaRawData: { data: string; valor: string }[] = await response.json();

      if (ipcaRawData.length === 0) {
        throw new Error('Nenhum dado de inflação encontrado para o período. Tente um período que já tenha terminado.');
      }

      const ipcaData = ipcaRawData.map(item => ({
        year: Number(item.data.split('/')[2]),
        month: Number(item.data.split('/')[1]),
        value: Number(item.valor),
      }));

      const inflationIndexMap = new Map<string, number>();
      let cumulativeIndex = 1;

      let currentDate = new Date(startYear, startMonth - 1, 1);
      const finalDate = new Date(endYear, endMonth - 1, 1);

      while (currentDate <= finalDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const key = `${year}-${month}`;

        const ipcaEntry = ipcaData.find(d => d.year === year && d.month === month);
        const monthlyInflation = ipcaEntry ? ipcaEntry.value / 100 : 0;

        cumulativeIndex = cumulativeIndex * (1 + monthlyInflation);
        inflationIndexMap.set(key, cumulativeIndex);

        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      const [refYear, refMonth] = referenceDate.split('-').map(Number);
      const refKey = `${refYear}-${refMonth}`;
      const referenceIndex = inflationIndexMap.get(refKey);

      if (!referenceIndex) {
        throw new Error(`Não foram encontrados dados de inflação para o mês de referência (${referenceDate}). Tente um mês que esteja dentro do período de análise.`);
      }

      const normalizedIndexMap = new Map<string, number>();
      inflationIndexMap.forEach((value, key) => {
        normalizedIndexMap.set(key, value / referenceIndex);
      });

      const filteredAndCalculatedPayslips = payslips.filter(p => {
        const pDate = new Date(p.year, p.month - 1, 1);
        const startDateObj = new Date(startYear, startMonth - 1, 1);
        return pDate >= startDateObj && pDate <= finalDate;
      }).map(p => {
        const key = `${p.year}-${p.month}`;
        const normalizedIndex = normalizedIndexMap.get(key) ?? 1;
        const realSalary = p.netTotal / normalizedIndex;
        return { ...p, realSalary };
      }).sort((a, b) => new Date(a.year, a.month - 1).getTime() - new Date(b.year, b.month - 1).getTime());

      if (filteredAndCalculatedPayslips.length === 0) {
        throw new Error("Nenhum contracheque encontrado no período de análise selecionado.");
      }

      const chartLabels = filteredAndCalculatedPayslips.map(p => new Date(p.year, p.month - 1).toLocaleString('pt-BR', { month: 'short', year: '2-digit' }));
      const nominalData = filteredAndCalculatedPayslips.map(p => p.netTotal);
      const realData = filteredAndCalculatedPayslips.map(p => p.realSalary);

      setPurchasingPowerData({ labels: chartLabels, nominal: nominalData, real: realData });

    } catch (e: any) {
      setCalculationError(e.message || 'Ocorreu um erro desconhecido.');
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  // Função de exportação removida

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
            <i className="fas fa-chart-line"></i>
          </div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">ANÁLISE DO PODER DE COMPRA (VS IPCA)</h3>
        </div>
        {/* Botão de exportar gráfico removido */}
      </div>
      <div className="flex flex-wrap items-end gap-4 p-4 bg-[var(--surface)] rounded-lg mb-4 text-sm">
        <div>
          <label htmlFor="ref-date" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Mês de Referência</label>
          <input type="month" id="ref-date" value={referenceDate} onChange={e => setReferenceDate(e.target.value)} className="bg-[var(--surface)] border border-[var(--border)] rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
        </div>
        <div>
          <label htmlFor="start-date-analysis" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Início da Análise</label>
          <input type="month" id="start-date-analysis" value={analysisStartDate} onChange={e => setAnalysisStartDate(e.target.value)} className="bg-[var(--surface)] border border-[var(--border)] rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
        </div>
        <div>
          <label htmlFor="end-date-analysis" className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Fim da Análise</label>
          <input type="month" id="end-date-analysis" value={analysisEndDate} onChange={e => setAnalysisEndDate(e.target.value)} className="bg-[var(--surface)] border border-[var(--border)] rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]" />
        </div>
        <button onClick={handleGeneratePurchasingPowerChart} disabled={isCalculating || !analysisStartDate || !analysisEndDate || !referenceDate} className="px-4 py-2 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[color-mix(in oklab, var(--primary) 60%, transparent)] disabled:cursor-not-allowed transition-colors w-36">
          {isCalculating ? <i className="fas fa-spinner fa-spin"></i> : 'Gerar Gráfico'}
        </button>
        {analysisStartDate && analysisEndDate && (
          <p className="ml-auto text-xs text-[var(--color-text-muted)]">
            {isInflationLoading ? 'Calculando inflação acumulada…' : (inflationSummary ?? '')}
          </p>
        )}
      </div>

      <div className="mt-4 min-h-[24rem]">
        {calculationError && <p className="text-[var(--destructive)] text-center p-4">{calculationError}</p>}
        {isCalculating && (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <i className="fas fa-chart-line text-4xl text-[var(--primary)] animate-pulse"></i>
            <p className="mt-4 text-[var(--color-text-muted)]">Buscando dados do IPCA e calculando...</p>
          </div>
        )}
        {purchasingPowerData && !isCalculating && <PurchasingPowerChart data={purchasingPowerData} />}
        {!purchasingPowerData && !isCalculating && !calculationError && (
          <div className="flex flex-col items-center justify-center text-center h-full text-[var(--color-text-muted)]">
            <i className="fas fa-search-dollar text-4xl mb-4"></i>
            <p>Selecione o período e clique em "Gerar Gráfico" para ver sua análise de poder de compra.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default PurchasingPowerCard;
