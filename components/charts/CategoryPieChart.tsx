import React, { useEffect, useRef } from 'react';

declare const Chart: any;

interface PieChartDataItem {
  label: string;
  value: number;
  color: string;
}

interface CategoryPieChartProps {
  data: PieChartDataItem[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      const labels = data.map(item => item.label);
      const values = data.map(item => item.value);
      
      // Map Tailwind bg colors to actual hex/rgba values for Chart.js
      // This is a simplified mapping. For a real app, you might need a more robust solution.
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
      const backgroundColors = data.map(item => colorMap[item.color] || 'rgba(156, 163, 175, 0.7)');

      chartInstanceRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: backgroundColors,
            borderColor: document.body.classList.contains('dark') ? '#1f2937' : '#ffffff', // bg-gray-800 or bg-white
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              display: false, // We'll render the legend manually
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.chart.getDatasetMeta(0).total || 1;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="h-48 w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default CategoryPieChart;