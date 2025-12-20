import React, { useMemo } from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

interface IncomeVsDeductionsChartProps {
  gross: number;
  deductions: number;
}

const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

const IncomeVsDeductionsChart: React.FC<IncomeVsDeductionsChartProps> = ({ gross, deductions }) => {
  const chartData = useMemo(() => (
    [
      { name: 'Total Bruto', value: gross },
      { name: 'Total Descontos', value: deductions },
    ]
  ), [gross, deductions]);

  const colors = ['var(--chart-2)', 'var(--destructive)'];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={2}>
            {chartData.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} fillOpacity={0.7} stroke={colors[idx % colors.length]} strokeOpacity={1} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => currencyFormatter(Number(value))} />
          <Legend
            verticalAlign="bottom"
            formatter={(value, entry: any) => (
              <span className="text-xs font-bold text-gray-600">
                {value}: {currencyFormatter(entry.payload.value)}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeVsDeductionsChart;
