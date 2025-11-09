import React, { useEffect, useRef } from 'react';

declare const Chart: any;

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

const CommittedSpendingChart: React.FC<CommittedSpendingChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;
      
      const labels = data.map(d => 
        new Date(2000, d.month - 1).toLocaleString('pt-BR', { month: 'short' })
      );

      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Salário Líquido',
              data: data.map(d => d.netSalary),
              backgroundColor: 'rgba(74, 222, 128, 0.4)', // green-300/40
              borderColor: 'rgba(34, 197, 94, 1)', // green-500
              borderWidth: 1,
              order: 3,
            },
            {
              label: 'Gastos à Vista',
              data: data.map(d => d.oneTimeExpenses),
              backgroundColor: 'rgba(251, 146, 60, 0.8)', // orange-400
              stack: 'committed',
              order: 2,
            },
            {
              label: 'Novos Parcelamentos',
              data: data.map(d => d.newInstallmentsTotal),
              backgroundColor: 'rgba(239, 68, 68, 0.8)', // red-500
              stack: 'committed',
              order: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { 
                  callback: (value: number) => 'R$ ' + (value/1000) + 'k',
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
              grid: { display: false }
            }
          },
          plugins: {
            legend: { 
                position: 'bottom',
                labels: {
                    color: document.body.classList.contains('dark') ? '#d1d5db' : '#374151',
                }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
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
    <div className="h-full w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default CommittedSpendingChart;
