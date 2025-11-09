import React, { useMemo } from 'react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';

interface PieChartDataItem {
  label: string;
  value: number;
  color: string;
}

interface CategoryPieChartProps {
  data: PieChartDataItem[];
}

const colorMap: { [key: string]: string } = {
  'bg-blue-500': 'rgba(59, 130, 246, 0.7)',
  'bg-green-500': 'rgba(34, 197, 94, 0.7)',
  'bg-yellow-500': 'rgba(234, 179, 8, 0.7)',
  'bg-purple-500': 'rgba(139, 92, 246, 0.7)',
  'bg-red-500': 'rgba(239, 68, 68, 0.7)',
  'bg-indigo-500': 'rgba(99, 102, 241, 0.7)',
  'bg-pink-500': 'rgba(236, 72, 153, 0.7)',
  'bg-gray-500': 'rgba(107, 114, 128, 0.7)',
  'bg-emerald-500': 'rgba(16, 185, 129, 0.7)',
  'bg-teal-500': 'rgba(20, 184, 166, 0.7)',
  'bg-stone-500': 'rgba(120, 113, 108, 0.7)',
};

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartData = useMemo(() => data.map(item => ({ name: item.label, value: item.value, color: colorMap[item.color] || 'rgba(156, 163, 175, 0.7)' })), [data]);
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
              <Cell key={`cell-${index}`} fill={entry.color} stroke={isDarkMode ? '#1f2937' : '#ffffff'} strokeWidth={2} />
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
