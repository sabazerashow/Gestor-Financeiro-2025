import React, { useEffect, useRef } from 'react';
import { Payslip } from '../../types';

declare const Chart: any;

interface NetSalaryChartProps {
  payslips: Payslip[];
}

const NetSalaryChart: React.FC<NetSalaryChartProps> = ({ payslips }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current && payslips.length > 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;
      
      const labels = payslips.map(p => 
        new Date(p.year, p.month - 1).toLocaleString('pt-BR', { month: 'short' })
      );
      const data = payslips.map(p => p.netTotal);

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Salário Líquido',
              data: data,
              borderColor: 'rgba(79, 70, 229, 1)',
              backgroundColor: 'rgba(79, 70, 229, 0.2)',
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: function (value: number) {
                  return 'R$ ' + value.toLocaleString('pt-BR');
                },
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
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
  }, [payslips]);

  return (
    <div className="h-80 w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default NetSalaryChart;
