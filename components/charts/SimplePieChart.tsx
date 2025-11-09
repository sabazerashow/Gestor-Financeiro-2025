import React, { useEffect, useRef } from 'react';

declare const Chart: any;

interface SimplePieChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

const SimplePieChart: React.FC<SimplePieChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  const generateColors = (numColors: number) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        const hue = (360 * (i * 0.61803398875)) % 360; // Using golden ratio for visually distinct colors
        colors.push(`hsla(${hue}, 65%, 60%, 0.8)`);
    }
    return colors;
  };
  
  const isDarkMode = document.body.classList.contains('dark');
  const legendColor = isDarkMode ? '#d1d5db' : '#374151';
  const borderColor = isDarkMode ? '#1f2937' : '#ffffff';


  useEffect(() => {
    if (chartRef.current && data.values.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      chartInstanceRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.values,
            backgroundColor: generateColors(data.values.length),
            borderWidth: 2,
            borderColor: borderColor,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
                color: legendColor,
                font: {
                    size: 10
                }
              },
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isDarkMode]);

  return (
    <div className="h-full w-full min-h-[250px]">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default SimplePieChart;
