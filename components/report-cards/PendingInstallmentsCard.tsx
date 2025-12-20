

import React, { useMemo } from 'react';
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
    <div className="p-8 h-full flex flex-col bg-white rounded-[32px] border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
          <i className="fas fa-calendar-alt"></i>
        </div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Parcelas Pendentes</h2>
      </div>

      {!pendingData ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-300">
          <i className="fas fa-calendar-check text-4xl mb-3"></i>
          <p className="text-sm italic">Nenhuma parcela pendente.</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</p>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingData.totalRemaining)}</p>
            <p className="text-xs text-gray-400 mt-1">em {pendingData.purchaseCount} compras ({pendingData.totalInstallmentsLeft} parcelas)</p>
          </div>

          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Próximos Lançamentos</h3>
          <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {pendingData.purchaseDetails.map((p, index) => (
              <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all">
                <div className="truncate pr-2 overflow-hidden">
                  <p className="font-bold text-gray-700 truncate text-xs" title={p.description}>{p.description}</p>
                  <p className="text-[10px] text-gray-400">{p.remainingCount} de {p.total} restantes</p>
                </div>
                <div className="text-right whitespace-nowrap font-bold text-gray-900 text-sm">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.remainingAmount)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default PendingInstallmentsCard;