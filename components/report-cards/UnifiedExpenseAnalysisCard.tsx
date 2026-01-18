import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Sector } from 'recharts';
import { Transaction, TransactionType, PaymentMethod } from '../../types';
import { categories } from '../../categories';

interface UnifiedExpenseAnalysisCardProps {
  transactions: Transaction[];
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', '#94a3b8'];

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
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'value'>('date');

  // 1. Prepare Data
  const expenses = useMemo(() =>
    transactions.filter(t => t.type === TransactionType.EXPENSE),
    [transactions]);

  const cashExpenses = useMemo(() => (
    expenses.filter(t => !t.installmentDetails || Number(t.installmentDetails.total) <= 1)
  ), [expenses]);

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
        value: value as number,
        color: categories[name]?.color || '#94a3b8',
        icon: categories[name]?.icon || 'fa-tag'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [expenses]);

  // Group by Method - Grouped: Crédito vs Outros Meios de Pagamento (à vista)
  const methodData = useMemo(() => {
    const grouped = cashExpenses.reduce((acc, t) => {
      const method = t.paymentMethod || PaymentMethod.OUTRO;
      const groupKey = method === PaymentMethod.CREDITO ? 'Crédito' : 'Outros Meios de Pagamento';
      acc[groupKey] = (acc[groupKey] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value: value as number,
        color: name === 'Crédito' ? '#f97316' : '#10b981'
      }))
      .sort((a, b) => b.value - a.value);
  }, [cashExpenses]);

  const currentChartData = activeTab === 'category' ? categoryData : methodData;

  // 2. Interactive List Logic
  const filteredList = useMemo(() => {
    let filtered = activeTab === 'method' ? cashExpenses : expenses;

    // Apply Drill-down filter
    if (filterKey) {
      if (activeTab === 'category') {
        filtered = filtered.filter(t => (t.category || 'Outros') === filterKey);
      } else {
        // Handle grouped payment methods
        if (filterKey === 'Crédito') {
          filtered = filtered.filter(t => t.paymentMethod === PaymentMethod.CREDITO);
        } else if (filterKey === 'Outros Meios de Pagamento') {
          filtered = filtered.filter(t =>
            t.paymentMethod !== PaymentMethod.CREDITO || !t.paymentMethod
          );
        }
      }
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      // Prioritize "A verificar" first
      if (a.category === 'A verificar' && b.category !== 'A verificar') return -1;
      if (b.category === 'A verificar' && a.category !== 'A verificar') return 1;

      // Then apply user-selected sort
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'name':
          return a.description.localeCompare(b.description, 'pt-BR');
        case 'value':
          return Number(b.amount) - Number(a.amount);
        default:
          return 0;
      }
    });

    return sorted;
  }, [expenses, cashExpenses, filterKey, activeTab, sortBy]);

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
          <div>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Análise Unificada</h2>
            <p className="text-xl font-black text-gray-900 tracking-tight">Gastos do Período</p>
          </div>
        </div>

        <div className="bg-gray-100/50 p-1.5 rounded-xl flex gap-1">
          <button
            onClick={() => { setActiveTab('category'); setActiveIndex(-1); setFilterKey(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'category'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            Por Categoria
          </button>
          <button
            onClick={() => { setActiveTab('method'); setActiveIndex(-1); setFilterKey(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'method'
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
          <div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                {filterKey ? `Filtrado por: ${filterKey}` : 'Todas as Transações'}
              </h3>
              <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full">
                {filteredList.length} itens
              </span>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-1 bg-gray-100/50 p-1 rounded-lg">
              <button
                onClick={() => setSortBy('date')}
                className={`flex-1 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${sortBy === 'date'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <i className="fas fa-calendar-alt mr-1"></i>Data
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`flex-1 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${sortBy === 'name'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <i className="fas fa-font mr-1"></i>Nome
              </button>
              <button
                onClick={() => setSortBy('value')}
                className={`flex-1 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${sortBy === 'value'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                <i className="fas fa-dollar-sign mr-1"></i>Valor
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <i className="fas fa-search text-2xl mb-2"></i>
                <p className="text-xs">Nenhuma transação encontrada</p>
              </div>
            ) : (
              filteredList.map((t) => {
                const isPending = t.category === 'A verificar';
                const isIncome = t.type === TransactionType.INCOME;
                
                return (
                  <div key={t.id} className="group/item flex items-center justify-between p-3 rounded-xl hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                        isPending ? 'bg-amber-100 text-amber-600' :
                        isIncome ? 'bg-emerald-100 text-emerald-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        <i className={`fas ${
                          isPending ? 'fa-clock' :
                          categories[t.category || '']?.icon || 'fa-tag'
                        }`}></i>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-700 truncate">{t.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-medium truncate">{t.category}</span>
                          {t.paymentMethod && (
                             <span className="text-[10px] text-gray-300">• {t.paymentMethod}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                       <p className={`text-xs font-black ${isIncome ? 'text-emerald-600' : 'text-gray-900'}`}>
                         {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                       </p>
                       <p className="text-[10px] text-gray-400">{new Date(`${t.date}T00:00:00`).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</p>
                    </div>
                  </div>
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
