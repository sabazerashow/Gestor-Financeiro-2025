import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface MonthlyData {
  month: number;
  netSalary: number;
  oneTimeExpenses: number;
  newInstallmentsTotal: number;
  totalCommitted: number;
  percentage: number;
}

interface CommittedSpendingChartProps {
  data: MonthlyData[];
}

const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

const CommittedSpendingChart: React.FC<CommittedSpendingChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.map(d => ({
      name: new Date(2000, d.month - 1).toLocaleString('pt-BR', { month: 'short' }),
      netSalary: d.netSalary,
      oneTimeExpenses: d.oneTimeExpenses,
      newInstallmentsTotal: d.newInstallmentsTotal,
    }));
  }, [data]);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={document.body.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
          <XAxis dataKey="name" tick={{ fill: document.body.classList.contains('dark') ? '#9ca3af' : '#4b5563' }} tickMargin={8} />
          <YAxis tick={{ fill: document.body.classList.contains('dark') ? '#9ca3af' : '#4b5563' }} tickFormatter={(v: number) => `R$ ${(v/1000).toFixed(1)}k`} />
          <Tooltip formatter={(value: any) => currencyFormatter(Number(value))} />
          <Legend verticalAlign="bottom" />
          <Bar dataKey="oneTimeExpenses" name="Gastos à Vista" stackId="committed" fill="rgba(251, 146, 60, 0.8)" />
          <Bar dataKey="newInstallmentsTotal" name="Novos Parcelamentos" stackId="committed" fill="rgba(239, 68, 68, 0.8)" />
          <Line type="monotone" dataKey="netSalary" name="Salário Líquido" stroke="rgba(34, 197, 94, 1)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommittedSpendingChart;
