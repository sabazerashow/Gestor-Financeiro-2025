import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Sector } from 'recharts';
import { Transaction, TransactionType, PaymentMethod } from '../../types';
import { categories } from '../../categories';

interface UnifiedExpenseAnalysisCardProps {
  transactions: Transaction[];
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', '#94a3b8'];
const PAYMENT_COLORS: Record<string, string> = {
  [PaymentMethod.CREDITO]: '#3b82f6', // blue-500
  [PaymentMethod.DEBITO]: '#10b981', // emerald-500
  [PaymentMethod.PIX]: '#8b5cf6', // violet-500
  [PaymentMethod.DINHEIRO]: '#f59e0b', // amber-500
  [PaymentMethod.OUTRO]: '#64748b', // slate-500
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#1f2937" className="text-xl font-black">
        {payload.percent ? `${(payload.percent * 100).toFixed(0)}%` : ''}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 8}
        outerRadius={innerRadius - 4}
        fill={fill}
      />
    </g>
  );
};

const UnifiedExpenseAnalysisCard: React.FC<UnifiedExpenseAnalysisCardProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<'category' | 'method'>('category');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [filterKey, setFilterKey] = useState<string | null>(null);

  // 1. Prepare Data
  const expenses = useMemo(() => 
    transactions.filter(t => t.type === TransactionType.EXPENSE), 
  [transactions]);

  const totalExpenses = useMemo(() => 
    expenses.reduce((sum, t) => sum + Number(t.amount), 0), 
  [expenses]);

  // Group by Category
  const categoryData = useMemo(() => {
    const grouped = expenses.reduce((acc, t) => {
      const cat = t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ 
        name, 
        value, 
        color: categories[name]?.color || '#94a3b8',
        icon: categories[name]?.icon || 'fa-tag'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [expenses]);

  // Group by Method
  const methodData = useMemo(() => {
    const grouped = expenses.reduce((acc, t) => {
      const method = t.paymentMethod || PaymentMethod.OUTRO;
      acc[method] = (acc[method] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ 
        name, 
        value,
        color: PAYMENT_COLORS[name] || '#64748b'
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const currentChartData = activeTab === 'category' ? categoryData : methodData;

  // 2. Interactive List Logic
  const filteredList = useMemo(() => {
    let filtered = expenses;
    
    // Apply Drill-down filter
    if (filterKey) {
      if (activeTab === 'category') {
        filtered = filtered.filter(t => (t.category || 'Outros') === filterKey);
      } else {
        filtered = filtered.filter(t => (t.paymentMethod || PaymentMethod.OUTRO) === filterKey);
      }
    }

    // Sort: Pending/Check first, then date desc
    return filtered.sort((a, b) => {
      // Prioritize "A verificar"
      if (a.category === 'A verificar' && b.category !== 'A verificar') return -1;
      if (b.category === 'A verificar' && a.category !== 'A verificar') return 1;
      
      // Then date
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [expenses, filterKey, activeTab]);

  const handlePieClick = (data: any, index: number) => {
    if (activeIndex === index) {
      setActiveIndex(-1);
      setFilterKey(null);
    } else {
      setActiveIndex(index);
      setFilterKey(data.name);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group h-full">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner">
            <i className="fas fa-chart-pie text-lg"></i>
          </div>
          <div>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Análise Unificada</h2>
            <p className="text-xl font-black text-gray-900 tracking-tight">Gastos do Período</p>
          </div>
        </div>

        <div className="bg-gray-100/50 p-1.5 rounded-xl flex gap-1">
          <button
            onClick={() => { setActiveTab('category'); setActiveIndex(-1); setFilterKey(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'category' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Por Categoria
          </button>
          <button
            onClick={() => { setActiveTab('method'); setActiveIndex(-1); setFilterKey(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'method' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Por Método
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[400px]">
        {/* Left: Donut Chart */}
        <div className="relative flex items-center justify-center">
           {/* Center Total */}
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
             <span className="text-2xl font-black text-gray-900 tracking-tight">
               {formatCurrency(totalExpenses)}
             </span>
           </div>

           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie
                 activeIndex={activeIndex}
                 activeShape={renderActiveShape}
                 data={currentChartData}
                 cx="50%"
                 cy="50%"
                 innerRadius={80}
                 outerRadius={110}
                 paddingAngle={4}
                 dataKey="value"
                 onClick={handlePieClick}
                 cursor="pointer"
               >
                 {currentChartData.map((entry, index) => (
                   <Cell 
                     key={`cell-${index}`} 
                     fill={activeTab === 'category' ? (COLORS[index % COLORS.length]) : (entry.color)} 
                     strokeWidth={0}
                   />
                 ))}
               </Pie>
               <RechartsTooltip 
                 formatter={(value: number) => formatCurrency(value)}
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
               />
             </PieChart>
           </ResponsiveContainer>
        </div>

        {/* Right: Transaction List */}
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50 rounded-3xl border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex justify-between items-center">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">
              {filterKey ? `Filtrado por: ${filterKey}` : 'Todas as Transações'}
            </h3>
            <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full">
              {filteredList.length} itens
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <i className="fas fa-search text-2xl mb-2"></i>
                <p className="text-xs">Nenhuma transação encontrada</p>
              </div>
            ) : (
              filteredList.map((t) => {
                const isPending = t.status === 'pending'; // Assuming status field exists or implied logic
                const isVerify = t.category === 'A verificar';
                
                return (
                  <motion.div
                    layout
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isPending ? 0.6 : 1, x: 0 }}
                    className={`p-3 rounded-xl border transition-all hover:shadow-md flex items-center justify-between gap-3 ${
                      isVerify 
                        ? 'bg-amber-50 border-amber-100' 
                        : 'bg-white border-gray-100 hover:border-indigo-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isVerify ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <i className={`fas ${categories[t.category]?.icon || 'fa-receipt'} text-sm`}></i>
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${isVerify ? 'text-amber-700' : 'text-gray-900'}`}>
                          {t.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span>{new Date(t.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</span>
                          <span>•</span>
                          <span className="uppercase">{t.paymentMethod}</span>
                          {isPending && (
                            <>
                              <span>•</span>
                              <span className="text-amber-500 flex items-center gap-1">
                                <i className="fas fa-clock"></i> Pendente
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="font-black text-gray-900 text-sm whitespace-nowrap">
                      {formatCurrency(Number(t.amount))}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedExpenseAnalysisCard;
