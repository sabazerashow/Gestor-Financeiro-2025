import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Line } from 'recharts';
import { Transaction, TransactionType } from '../../types';

interface CashFlowEvolutionCardProps {
  transactions: Transaction[];
  currentMonth: string; // Format "YYYY-MM"
}

const CashFlowEvolutionCard: React.FC<CashFlowEvolutionCardProps> = ({ transactions, currentMonth }) => {
  const [year, month] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const currentDay = today.getDate();
  const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
  const parseAmount = (value: unknown) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value !== 'string') return 0;

    const raw = value.trim();
    if (!raw) return 0;

    const cleaned = raw.replace(/[^\d,.-]/g, '');
    if (!cleaned) return 0;

    const hasComma = cleaned.includes(',');
    const normalized = hasComma
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : cleaned;

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getDateParts = (dateStr: string): { year: number; month: number; day: number } | null => {
    const s = (dateStr || '').trim();
    if (!s) return null;

    const datePart = s.split('T')[0];

    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(datePart)) {
      const [y, m, d] = datePart.split('-').map(Number);
      if (!y || !m || !d) return null;
      return { year: y, month: m, day: d };
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(datePart)) {
      const [d, m, y] = datePart.split('/').map(Number);
      if (!y || !m || !d) return null;
      return { year: y, month: m, day: d };
    }

    const dt = new Date(s);
    if (Number.isNaN(dt.getTime())) return null;
    return { year: dt.getFullYear(), month: dt.getMonth() + 1, day: dt.getDate() };
  };

  const data = useMemo(() => {
    const dailyData: any[] = [];
    let accIncome = 0;
    let accExpense = 0;
    let intersectionPoint = null;

    // Pre-process transactions by day
    const txByDay: Record<number, { income: number; expense: number }> = {};
    
    transactions
      .forEach(t => {
      const parts = getDateParts(t.date);
      if (!parts || parts.year !== year || parts.month !== month) return;

      const d = parts.day;
      if (!txByDay[d]) txByDay[d] = { income: 0, expense: 0 };
      
      const amount = parseAmount((t as any).amount);
      if (t.type === TransactionType.INCOME) {
        txByDay[d].income += amount;
      } else {
        txByDay[d].expense += amount;
      }
    });

    for (let d = 1; d <= daysInMonth; d++) {
      const dayValues = txByDay[d] || { income: 0, expense: 0 };
      const prevIncome = accIncome;
      const prevExpense = accExpense;
      
      accIncome += dayValues.income;
      accExpense += dayValues.expense;

      // Check for intersection (Red crossing Green upwards)
      // Only meaningful if it wasn't already above
      if (!intersectionPoint && prevExpense <= prevIncome && accExpense > accIncome) {
        intersectionPoint = { day: d, value: accExpense };
      }

      // Logic for Solid vs Dashed
      // If isCurrentMonth, split at currentDay.
      // Solid: up to currentDay.
      // Dashed: from currentDay onwards.
      
      const isPast = !isCurrentMonth || d <= currentDay;
      const isFuture = isCurrentMonth && d >= currentDay; // Overlap on currentDay for continuity

      dailyData.push({
        day: d,
        incomeDay: dayValues.income,
        expenseDay: dayValues.expense,
        incomeFull: accIncome,
        expenseFull: accExpense,
        netFull: accIncome - accExpense,
        
        incomeSolid: isPast ? accIncome : null,
        incomeDashed: isFuture ? accIncome : null,
        
        expenseSolid: isPast ? accExpense : null,
        expenseDashed: isFuture ? accExpense : null,
        
        isIntersection: intersectionPoint && intersectionPoint.day === d
      });
    }
    
    return { dailyData, intersectionPoint };
  }, [transactions, daysInMonth, currentDay, isCurrentMonth, year, month]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const p = payload[0]?.payload;
    if (!p) return null;
    const labelDate = new Date(year, month - 1, Number(label)).toLocaleDateString('pt-BR');
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4">
        <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">{labelDate}</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Entradas no dia</span>
            <span className="text-xs font-black text-emerald-600 tabular-nums">{formatCurrency(Number(p.incomeDay || 0))}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Saídas no dia</span>
            <span className="text-xs font-black text-red-600 tabular-nums">{formatCurrency(Number(p.expenseDay || 0))}</span>
          </div>
          <div className="h-px w-full bg-gray-100 my-2" />
          <div className="flex items-center justify-between gap-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Entradas acumuladas</span>
            <span className="text-xs font-black text-gray-900 tabular-nums">{formatCurrency(Number(p.incomeFull || 0))}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Saídas acumuladas</span>
            <span className="text-xs font-black text-gray-900 tabular-nums">{formatCurrency(Number(p.expenseFull || 0))}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Saldo acumulado</span>
            <span className={`text-xs font-black tabular-nums ${Number(p.netFull || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(Number(p.netFull || 0))}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group h-full relative overflow-hidden">
       {/* Header */}
       <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Fluxo de Caixa</h2>
          <p className="text-xl font-black text-gray-900 tracking-tight">Evolução Mensal</p>
        </div>
        
        {/* Status Indicator */}
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
             <span className="text-gray-500">Receitas</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             <span className="text-gray-500">Despesas</span>
           </div>
        </div>
      </div>

      <div className="h-[300px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              interval={4}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              tickFormatter={(val) => `R$ ${val/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Areas (Gradient Fills) - Using Full Data for smooth fill */}
            <Area 
              type="monotone" 
              dataKey="incomeFull" 
              stroke="none" 
              fillOpacity={1} 
              fill="url(#colorIncome)" 
            />
            <Area 
              type="monotone" 
              dataKey="expenseFull" 
              stroke="none" 
              fillOpacity={1} 
              fill="url(#colorExpense)" 
            />

            {/* Solid Lines (Past) */}
            <Line type="monotone" dataKey="incomeSolid" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="expenseSolid" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />

            {/* Dashed Lines (Projection) */}
            <Line type="monotone" dataKey="incomeDashed" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="expenseDashed" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" dot={false} />

            {/* Intersection Point Highlight */}
            {data.intersectionPoint && (
              <ReferenceDot 
                x={data.intersectionPoint.day} 
                y={data.intersectionPoint.value} 
                r={6} 
                fill="#fff" 
                stroke="#ef4444" 
                strokeWidth={2}
                isFront={true}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Insight Alert */}
      {data.intersectionPoint && (
        <div className="absolute bottom-6 right-8 bg-red-50 border border-red-100 px-4 py-2 rounded-xl flex items-center gap-3 animate-fade-in">
           <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
             <i className="fas fa-triangle-exclamation text-xs"></i>
           </div>
           <div>
             <p className="text-[10px] font-bold text-red-400 uppercase">Alerta de Saldo</p>
             <p className="text-xs font-bold text-red-700">Despesas superam receitas no dia {data.intersectionPoint.day}</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowEvolutionCard;
