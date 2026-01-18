

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '../../types';

interface PendingInstallmentsCardProps {
  allTransactions: Transaction[];
}

interface InstallmentItem {
  description: string;
  current: number;
  total: number;
  amount: number;
  date: string;
  daysUntilDue: number;
}

const PendingInstallmentsCard: React.FC<PendingInstallmentsCardProps> = ({ allTransactions }) => {
  const commitmentData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const installmentTransactions = allTransactions.filter(t => t.installmentDetails);

    // Separate overdue and upcoming
    const overdue: InstallmentItem[] = [];
    const upcomingNext30Days: InstallmentItem[] = [];

    installmentTransactions.forEach(t => {
      const dueDate = new Date(t.date + 'T00:00:00');
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const item: InstallmentItem = {
        description: t.description.replace(/\s\(\d+\/\d+\)$/, ''),
        current: t.installmentDetails!.current,
        total: t.installmentDetails!.total,
        amount: Number(t.amount),
        date: t.date,
        daysUntilDue: diffDays
      };

      if (diffDays < 0) {
        overdue.push(item);
      } else if (diffDays <= 30) {
        upcomingNext30Days.push(item);
      }
    });

    // Sort by due date (closest first)
    overdue.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    upcomingNext30Days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      hasOverdue: overdue.length > 0,
      overdueCount: overdue.length,
      overdueTotal: overdue.reduce((sum, item) => sum + item.amount, 0),
      overdueItems: overdue,
      upcomingCount: upcomingNext30Days.length,
      upcomingTotal: upcomingNext30Days.reduce((sum, item) => sum + item.amount, 0),
      upcomingItems: upcomingNext30Days
    };
  }, [allTransactions]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 h-full flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-inner transition-colors duration-500 ${commitmentData.hasOverdue
              ? 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white'
              : 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'
            }`}>
            <i className={`fas ${commitmentData.hasOverdue ? 'fa-exclamation-triangle' : 'fa-calendar-check'}`}></i>
          </div>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {commitmentData.hasOverdue ? 'Parcelas Atrasadas' : 'Túnel de Compromissos'}
          </h2>
        </div>
      </div>

      {commitmentData.hasOverdue ? (
        // OVERDUE MODE: Show urgent/red UI
        <div className="flex flex-col flex-grow">
          <div className="text-center mb-8 p-4 bg-red-50/50 rounded-2xl border border-red-100">
            <div className="flex items-center justify-center gap-2 mb-2">
              <i className="fas fa-exclamation-circle text-red-500 text-lg"></i>
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Atenção Necessária</p>
            </div>
            <p className="text-3xl font-black text-red-600 tracking-tighter tabular-nums">
              {formatCurrency(commitmentData.overdueTotal)}
            </p>
            <p className="text-[10px] font-bold text-red-400 mt-2 uppercase tracking-tighter">
              {commitmentData.overdueCount} {commitmentData.overdueCount === 1 ? 'parcela atrasada' : 'parcelas atrasadas'}
            </p>
          </div>

          <h3 className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em] mb-4 ml-1">
            <i className="fas fa-fire mr-1"></i>Pendências Urgentes
          </h3>
          <ul className="space-y-2 list-none m-0 p-0 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
            {commitmentData.overdueItems.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex justify-between items-center p-4 bg-red-50 rounded-2xl border border-red-100 hover:border-red-200 hover:bg-red-100/50 transition-all group/item"
              >
                <div className="truncate pr-4 flex-1">
                  <p className="font-black text-red-700 truncate text-xs group-hover/item:text-red-800 transition-colors" title={item.description}>
                    {item.description}
                  </p>
                  <p className="text-[10px] font-bold text-red-400 tracking-tighter mt-0.5">
                    ({item.current}/{item.total}) • Atrasado há {Math.abs(item.daysUntilDue)} {Math.abs(item.daysUntilDue) === 1 ? 'dia' : 'dias'}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap font-black text-red-600 text-sm tabular-nums">
                  {formatCurrency(item.amount)}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      ) : commitmentData.upcomingCount > 0 ? (
        // UP TO DATE MODE: Show upcoming 30 days
        <div className="flex flex-col flex-grow">
          <div className="text-center mb-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <i className="fas fa-calendar-day text-blue-500 text-lg"></i>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Próximos 30 dias</p>
            </div>
            <p className="text-3xl font-black text-blue-600 tracking-tighter tabular-nums">
              {formatCurrency(commitmentData.upcomingTotal)}
            </p>
            <p className="text-[10px] font-bold text-blue-400 mt-2 uppercase tracking-tighter">
              {commitmentData.upcomingCount} {commitmentData.upcomingCount === 1 ? 'parcela programada' : 'parcelas programadas'}
            </p>
          </div>

          <h3 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 ml-1">
            <i className="fas fa-route mr-1"></i>Planejamento do Mês
          </h3>
          <ul className="space-y-2 list-none m-0 p-0 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
            {commitmentData.upcomingItems.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/10 transition-all group/item"
              >
                <div className="truncate pr-4 flex-1">
                  <p className="font-black text-gray-800 truncate text-xs group-hover/item:text-blue-600 transition-colors" title={item.description}>
                    {item.description}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 tracking-tighter mt-0.5">
                    ({item.current}/{item.total}) • Vence em {item.daysUntilDue === 0 ? 'hoje' : item.daysUntilDue === 1 ? '1 dia' : `${item.daysUntilDue} dias`}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap font-black text-gray-900 text-sm tabular-nums">
                  {formatCurrency(item.amount)}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      ) : (
        // NO INSTALLMENTS: Everything is paid and no upcoming
        <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100">
            <i className="fas fa-check-circle text-2xl"></i>
          </div>
          <p className="text-sm font-bold text-emerald-600 mb-1">Sem compromissos!</p>
          <p className="text-xs text-gray-400 italic">Nenhuma parcela nos próximos 30 dias</p>
        </div>
      )}
    </motion.div>
  );
};

export default PendingInstallmentsCard;