import React, { useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface PurchasingPowerChartProps {
  data: {
    labels: string[];
    nominal: number[];
    real: number[];
  };
}

export interface PurchasingPowerChartRef {
  exportChart: () => string | null;
}

const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

const PurchasingPowerChart = forwardRef<PurchasingPowerChartRef, PurchasingPowerChartProps>(({ data }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    exportChart: () => {
      const svg = containerRef.current?.querySelector('svg');
      if (!svg) return null;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const encoded = encodeURIComponent(svgString);
      return `data:image/svg+xml;charset=utf-8,${encoded}`;
    },
  }));

  const chartData = useMemo(() => {
    return data.labels.map((label, idx) => ({
      name: label,
      nominal: data.nominal[idx] ?? 0,
      real: data.real[idx] ?? 0,
    }));
  }, [data]);

  return (
    <div ref={containerRef} className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={document.body.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
          <XAxis dataKey="name" tick={{ fill: document.body.classList.contains('dark') ? '#9ca3af' : '#4b5563' }} />
          <YAxis tick={{ fill: document.body.classList.contains('dark') ? '#9ca3af' : '#4b5563' }} tickFormatter={(v: number) => currencyFormatter(v)} />
          <Tooltip formatter={(value: any) => currencyFormatter(Number(value))} />
          <Legend verticalAlign="top" />
          <Line type="monotone" dataKey="nominal" name="Salário Nominal" stroke="rgba(129, 140, 248, 1)" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="real" name="Poder de Compra (Salário Real)" stroke="rgba(16, 185, 129, 1)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

export default PurchasingPowerChart;
