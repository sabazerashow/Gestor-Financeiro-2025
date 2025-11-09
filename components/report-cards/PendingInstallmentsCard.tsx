

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

    // FIX: Explicitly type the accumulator of the reduce function to prevent type errors.
    const purchases = futureInstallments.reduce<Record<string, { description: string; remainingCount: number; total: number; remainingAmount: number }>>((acc, t) => {
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
    }, {});

    const purchaseDetails = Object.values(purchases).sort((a,b) => b.remainingAmount - a.remainingAmount);

    return {
      totalRemaining,
      purchaseCount: purchaseDetails.length,
      totalInstallmentsLeft: futureInstallments.length,
      purchaseDetails,
    };
  }, [allTransactions]);

  return (
    <div className="p-6 col-span-1 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Parcelas Pendentes</h2>
        <i className="fas fa-calendar-alt text-2xl text-gray-400 dark:text-gray-500"></i>
      </div>
      {!pendingData ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <i className="fas fa-calendar-check text-4xl mb-3"></i>
            <p>Nenhuma parcela pendente encontrada.</p>
        </div>
      ) : (
        <>
            <div className="text-center mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total a Pagar</p>
                <p className="text-3xl font-bold text-orange-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingData.totalRemaining)}</p>
                <p className="text-xs text-gray-400">em {pendingData.purchaseCount} compra(s) com {pendingData.totalInstallmentsLeft} parcelas restantes</p>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Próximos Lançamentos:</h3>
            <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
                {pendingData.purchaseDetails.map((p, index) => (
                <li key={index} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <div className="truncate pr-2">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate" title={p.description}>{p.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.remainingCount} de {p.total} parcelas restantes</p>
                    </div>
                    <div className="text-right whitespace-nowrap font-semibold text-gray-700 dark:text-gray-200">
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