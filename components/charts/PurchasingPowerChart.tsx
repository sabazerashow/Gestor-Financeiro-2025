import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

declare const Chart: any;

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

const PurchasingPowerChart = forwardRef<PurchasingPowerChartRef, PurchasingPowerChartProps>(({ data }, ref) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    exportChart: () => {
      if (chartInstanceRef.current) {
        return chartInstanceRef.current.toBase64Image('image/png', 1);
      }
      return null;
    }
  }));

  useEffect(() => {
    if (chartRef.current && data) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Salário Nominal',
              data: data.nominal,
              borderColor: 'rgba(129, 140, 248, 1)', // Indigo-400
              backgroundColor: 'rgba(129, 140, 248, 0.2)',
              fill: false,
              tension: 0.1,
              pointRadius: 3,
              pointHoverRadius: 6,
            },
            {
              label: 'Poder de Compra (Salário Real)',
              data: data.real,
              borderColor: 'rgba(16, 185, 129, 1)', // Emerald-500
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              fill: true,
              tension: 0.3,
              borderDash: [5, 5],
              pointRadius: 3,
              pointHoverRadius: 6,
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              ticks: { 
                  callback: (value: number) => 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                  color: document.body.classList.contains('dark') ? '#9ca3af' : '#4b5563',
                },
              grid: {
                color: document.body.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }
            },
            x: {
              ticks: { 
                  color: document.body.classList.contains('dark') ? '#9ca3af' : '#4b5563',
              },
               grid: {
                display: false,
              }
            }
          },
          plugins: {
            legend: { 
                position: 'top',
                labels: {
                    color: document.body.classList.contains('dark') ? '#d1d5db' : '#374151',
                }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index',
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
    <div className="h-96 w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
});

export default PurchasingPowerChart;
