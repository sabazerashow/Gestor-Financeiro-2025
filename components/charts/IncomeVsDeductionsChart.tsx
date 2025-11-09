import React, { useEffect, useRef } from 'react';

declare const Chart: any;

interface IncomeVsDeductionsChartProps {
  gross: number;
  deductions: number;
}

const IncomeVsDeductionsChart: React.FC<IncomeVsDeductionsChartProps> = ({ gross, deductions }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current && (gross > 0 || deductions > 0)) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      chartInstanceRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Total Bruto', 'Total Descontos'],
          datasets: [
            {
              data: [gross, deductions],
              backgroundColor: [
                'rgba(16, 185, 129, 0.7)', // Green
                'rgba(239, 68, 68, 0.7)', // Red
              ],
              borderColor: [
                'rgba(16, 185, 129, 1)',
                'rgba(239, 68, 68, 1)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
            },
            tooltip: {
              callbacks: {
                label: function (context: any) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed !== null) {
                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed);
                  }
                  return label;
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
  }, [gross, deductions]);

  return (
    <div className="h-80 w-full flex items-center justify-center">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default IncomeVsDeductionsChart;
