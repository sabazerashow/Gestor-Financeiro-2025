import React, { useMemo } from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

interface SimplePieChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

const SimplePieChart: React.FC<SimplePieChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data.labels.map((label, idx) => ({ name: label, value: data.values[idx] ?? 0 }));
  }, [data]);

  const total = useMemo(() => chartData.reduce((sum, d) => sum + (d.value || 0), 0), [chartData]);

  const generateColors = (numColors: number) => {
    const colors: string[] = [];
    for (let i = 0; i < numColors; i++) {
      const hue = (360 * (i * 0.61803398875)) % 360;
      colors.push(`hsla(${hue}, 65%, 60%, 0.8)`);
    }
    return colors;
  };
  const colors = useMemo(() => generateColors(chartData.length), [chartData.length]);

  const isDarkMode = typeof document !== 'undefined' && document.body.classList.contains('dark');
  const legendColor = isDarkMode ? '#d1d5db' : '#374151';

  return (
    <div className="h-full w-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke={isDarkMode ? '#1f2937' : '#ffffff'} strokeWidth={2} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ color: legendColor }} />
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

export default SimplePieChart;
