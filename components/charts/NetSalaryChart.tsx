import React, { useMemo } from 'react';
import { Payslip } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface NetSalaryChartProps {
  payslips: Payslip[];
}

const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

const NetSalaryChart: React.FC<NetSalaryChartProps> = ({ payslips }) => {
  const chartData = useMemo(() => (
    payslips.map(p => ({
      name: new Date(p.year, p.month - 1).toLocaleString('pt-BR', { month: 'short' }),
      netTotal: p.netTotal,
    }))
  ), [payslips]);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 0, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={"rgba(0,0,0,0.05)"} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700 }}
            tickFormatter={(v: number) => currencyFormatter(v)}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip formatter={(value: any) => currencyFormatter(Number(value))} />
          <Line type="monotone" dataKey="netTotal" stroke={'var(--primary)'} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetSalaryChart;
