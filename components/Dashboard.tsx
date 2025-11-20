import React from 'react';
import { DashboardCardConfig } from '../App';
import DashboardCard from './DashboardCard';
import ManageCardsModal from './ManageCardsModal';

interface DashboardProps {
    title?: string;
    allCards: DashboardCardConfig[];
    cardVisibility: Record<string, boolean>;
    componentProps: Record<string, any>;
    onToggleCard: (cardId: string) => void;
    onSetCardOrder: (order: string[]) => void;
    isManageCardsModalOpen: boolean;
    setIsManageCardsModalOpen: (isOpen: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    title = "Dashboard de Relatórios", 
    allCards, 
    cardVisibility, 
    componentProps,
    onToggleCard,
    onSetCardOrder,
    isManageCardsModalOpen,
    setIsManageCardsModalOpen
}) => {
    
    const visibleCards = allCards.filter(card => cardVisibility[card.id]);

    return (
        <div className="bg-[var(--card)] p-6 rounded-xl shadow-lg space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[var(--color-text)]">{title}</h2>
                <button onClick={() => setIsManageCardsModalOpen(true)} className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-[var(--surface)] text-[var(--color-text)] hover:bg-[var(--color-surface)]/60 border border-[var(--border)] shadow-sm">
                    Gerenciar cartões
                </button>
            </div>

            {visibleCards.length === 0 ? (
                <div className="text-center py-16">
                    <i className="fas fa-grip-horizontal text-5xl text-[var(--color-text-muted)]"></i>
                    <p className="mt-4 text-[var(--color-text-muted)]">Nenhum cartão visível.</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Use o botão "Gerenciar cartões" para adicionar alguns ao seu painel.</p>
                </div>
            ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {visibleCards.map(card => {
                        const CardComponent = card.component;
                        const props = componentProps[card.id] || {};
                        const cardContent = <CardComponent {...props} />;
                        
                        return (
                            <DashboardCard key={card.id} title={card.title}>
                               {cardContent}
                            </DashboardCard>
                        )
                    })}
                </div>
            )}

            <ManageCardsModal
                isOpen={isManageCardsModalOpen}
                onClose={() => setIsManageCardsModalOpen(false)}
                allCards={allCards}
                visibility={cardVisibility}
                onToggle={onToggleCard}
                onOrderChange={onSetCardOrder}
            />
        </div>
    )
};

export default Dashboard;
