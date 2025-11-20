

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
        <h2 className="text-xl font-bold text-[var(--color-text)]">Parcelas Pendentes</h2>
        <i className="fas fa-calendar-alt text-2xl text-[var(--color-text-muted)]"></i>
      </div>
      {!pendingData ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-[var(--color-text-muted)]">
            <i className="fas fa-calendar-check text-4xl mb-3"></i>
            <p>Nenhuma parcela pendente encontrada.</p>
        </div>
      ) : (
        <>
            <div className="text-center mb-4">
                <p className="text-sm text-[var(--color-text-muted)]">Valor Total a Pagar</p>
                <p className="text-3xl font-bold text-[var(--warning)]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingData.totalRemaining)}</p>
                <p className="text-xs text-[var(--color-text-muted)]">em {pendingData.purchaseCount} compra(s) com {pendingData.totalInstallmentsLeft} parcelas restantes</p>
            </div>

            <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-2">Próximos Lançamentos:</h3>
            <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
                {pendingData.purchaseDetails.map((p, index) => (
                <li key={index} className="flex justify-between p-2 bg-[var(--surface)] rounded-md">
                    <div className="truncate pr-2">
                    <p className="font-medium text-[var(--color-text)] truncate" title={p.description}>{p.description}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{p.remainingCount} de {p.total} parcelas restantes</p>
                    </div>
                    <div className="text-right whitespace-nowrap font-semibold text-[var(--color-text)]">
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