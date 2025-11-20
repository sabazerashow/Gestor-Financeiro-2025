import React, { useMemo } from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';

interface PieChartDataItem {
  label: string;
  value: number;
  color: string; // expect CSS color (e.g., 'var(--chart-1)')
}

interface CategoryPieChartProps {
  data: PieChartDataItem[];
}

// Colors now come from design tokens via CSS variables; no Tailwind mapping needed.

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartData = useMemo(
    () => data.map(item => ({ name: item.label, value: item.value, color: item.color || 'var(--chart-5)' })),
    [data]
  );
  const total = useMemo(() => chartData.reduce((sum, d) => sum + (d.value || 0), 0), [chartData]);
  const isDarkMode = typeof document !== 'undefined' && document.body.classList.contains('dark');

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name: any) => {
              const val = Number(value) || 0;
              const pct = total ? ((val / total) * 100).toFixed(1) : '0.0';
              return [
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val) + ` (${pct}%)`,
                name,
              ];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
