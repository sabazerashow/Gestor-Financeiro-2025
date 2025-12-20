

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '../../types';

interface PendingInstallmentsCardProps {
  allTransactions: Transaction[];
}

const PendingInstallmentsCard: React.FC<PendingInstallmentsCardProps> = ({ allTransactions }) => {
  const pendingData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureInstallments = allTransactions.filter(t =>
      t.installmentDetails && new Date(t.date + 'T00:00:00') >= today
    );

    const totalRemaining = futureInstallments.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    if (totalRemaining === 0) {
      return null;
    }

    interface PurchaseInfo {
      description: string;
      remainingCount: number;
      total: number;
      remainingAmount: number;
    }

    const initialAcc: Record<string, PurchaseInfo> = {};

    const purchases = futureInstallments.reduce((acc, t) => {
      const id = t.installmentDetails!.purchaseId;
      if (!acc[id]) {
        acc[id] = {
          description: t.description.replace(/\s\(\d+\/\d+\)$/, ''),
          remainingCount: 0,
          total: t.installmentDetails!.total,
          remainingAmount: 0,
        };
      }
      acc[id].remainingCount++;
      acc[id].remainingAmount += (Number(t.amount) || 0);
      return acc;
    }, initialAcc);

    const purchaseDetails = (Object.values(purchases) as PurchaseInfo[]).sort((a, b) => b.remainingAmount - a.remainingAmount);

    return {
      totalRemaining,
      purchaseCount: purchaseDetails.length,
      totalInstallmentsLeft: futureInstallments.length,
      purchaseDetails,
    };
  }, [allTransactions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 h-full flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-500 shadow-inner">
            <i className="fas fa-calendar-alt text-sm"></i>
          </div>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Parcelas Pendentes</h2>
        </div>
      </div>

      {!pendingData ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-4 border border-gray-50">
            <i className="fas fa-calendar-check text-2xl"></i>
          </div>
          <p className="text-sm font-medium text-gray-400 italic">Tudo em dia!</p>
        </div>
      ) : (
        <div className="flex flex-col flex-grow">
          <div className="text-center mb-8 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dívida Futura Total</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter tabular-nums">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingData.totalRemaining)}
            </p>
            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tighter">
              {pendingData.purchaseCount} compras • {pendingData.totalInstallmentsLeft} parcelas
            </p>
          </div>

          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Projeção de Lançamentos</h3>
          <ul className="space-y-2 list-none m-0 p-0 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
            {pendingData.purchaseDetails.map((p, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/10 transition-all group/item"
              >
                <div className="truncate pr-4 flex-1">
                  <p className="font-black text-gray-800 truncate text-xs group-hover/item:text-blue-600 transition-colors" title={p.description}>{p.description}</p>
                  <p className="text-[10px] font-bold text-gray-400 tracking-tighter mt-0.5">
                    {p.remainingCount} de {p.total} restantes
                  </p>
                </div>
                <div className="text-right whitespace-nowrap font-black text-gray-900 text-sm tabular-nums">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.remainingAmount)}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default PendingInstallmentsCard;