import React, { useState } from 'react';
import { Bill } from '../types';
import SubscriptionKPIHeader from './SubscriptionKPIHeader';
import FixedCostThermometer from './FixedCostThermometer';
import ContractAlerts from './ContractAlerts';
import SubscriptionCalendar from './SubscriptionCalendar';
import SubscriptionsList from './SubscriptionsList';
import AddSubscriptionForm from './AddSubscriptionForm';
import { motion, AnimatePresence } from 'framer-motion';

interface SubscriptionsViewProps {
    bills: Bill[];
    monthlyIncome?: number;
    onMarkAsPaid: (billId: string) => void;
    onEdit: (bill: Bill) => void;
    onDelete: (billId: string) => void;
    onBillClick?: (bill: Bill) => void;
    onAddBill: (bill: Omit<Bill, 'id' | 'recurringTransactionId'>) => void;
}

const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
    bills,
    monthlyIncome = 5000,
    onMarkAsPaid,
    onEdit,
    onDelete,
    onBillClick,
    onAddBill,
}) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header com botão de adicionar */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">
                        Assinaturas & Recorrência
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gerencie suas contas fixas e assinaturas de forma inteligente
                    </p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                >
                    <i className="fas fa-plus text-lg group-hover:rotate-90 transition-transform"></i>
                    <span className="hidden md:inline">Nova Assinatura</span>
                    <span className="md:hidden">Adicionar</span>
                </button>
            </div>

            {/* KPIs Header - 3 cards principais */}
            <SubscriptionKPIHeader bills={bills} monthlyIncome={monthlyIncome} />

            {/* Termômetro de Custo Fixo */}
            <FixedCostThermometer bills={bills} monthlyIncome={monthlyIncome} />

            {/* Alertas de Contratos */}
            <ContractAlerts bills={bills} />

            {/* Calendário de Vencimentos - Agora com largura total */}
            <SubscriptionCalendar bills={bills} onBillClick={onBillClick} />

            {/* Lista Inteligente de Assinaturas */}
            <SubscriptionsList
                bills={bills}
                onMarkAsPaid={onMarkAsPaid}
                onEdit={onEdit}
                onDelete={onDelete}
            />

            {/* Modal de Adicionar Assinatura */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsAddModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <i className="fas fa-plus text-white"></i>
                                    </div>
                                    <h2 className="text-xl font-black text-gray-800">Nova Assinatura</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex items-center justify-center"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <div className="p-6">
                                <AddSubscriptionForm
                                    onAddBill={(bill) => {
                                        onAddBill(bill);
                                        setIsAddModalOpen(false);
                                    }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubscriptionsView;
