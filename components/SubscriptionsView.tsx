import React from 'react';
import { Bill } from '../types';
import SubscriptionKPIHeader from './SubscriptionKPIHeader';
import FixedCostThermometer from './FixedCostThermometer';
import ContractAlerts from './ContractAlerts';
import SubscriptionCalendar from './SubscriptionCalendar';
import SubscriptionsList from './SubscriptionsList';

interface SubscriptionsViewProps {
    bills: Bill[];
    monthlyIncome?: number;
    onMarkAsPaid: (billId: string) => void;
    onEdit: (bill: Bill) => void;
    onDelete: (billId: string) => void;
    onBillClick?: (bill: Bill) => void;
}

const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
    bills,
    monthlyIncome = 5000,
    onMarkAsPaid,
    onEdit,
    onDelete,
    onBillClick,
}) => {
    return (
        <div className="space-y-6">
            {/* KPIs Header - 3 cards principais */}
            <SubscriptionKPIHeader bills={bills} monthlyIncome={monthlyIncome} />

            {/* Termômetro de Custo Fixo */}
            <FixedCostThermometer bills={bills} monthlyIncome={monthlyIncome} />

            {/* Alertas de Contratos */}
            <ContractAlerts bills={bills} />

            {/* Calendário de Vencimentos */}
            <SubscriptionCalendar bills={bills} onBillClick={onBillClick} />

            {/* Lista Inteligente de Assinaturas */}
            <SubscriptionsList
                bills={bills}
                onMarkAsPaid={onMarkAsPaid}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
};

export default SubscriptionsView;
