import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bill, Transaction } from '../types';
import { getUpcomingCommitments } from '../lib/projectionCalculator';
import { colors } from '../lib/designSystem';

interface CommitmentRadarCardProps {
    bills: Bill[];
    transactions: Transaction[];
}

const CommitmentRadarCard: React.FC<CommitmentRadarCardProps> = ({ bills, transactions }) => {
    const commitments = useMemo(
        () => getUpcomingCommitments(bills, transactions, 5),
        [bills, transactions]
    );

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const formatDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);

        if (compareDate.getTime() === today.getTime()) return 'Hoje';
        if (compareDate.getTime() === tomorrow.getTime()) return 'Amanhã';

        const diffTime = compareDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0 && diffDays <= 7) return `Em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;

        return compareDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const getStatusColor = (status: 'paid' | 'urgent' | 'upcoming') => {
        switch (status) {
            case 'paid':
                return {
                    bg: '#ECFDF5',
                    text: colors.success,
                    border: '#A7F3D0'
                };
            case 'urgent':
                return {
                    bg: '#FEF2F2',
                    text: colors.danger,
                    border: '#FECACA'
                };
            case 'upcoming':
                return {
                    bg: colors.background.secondary,
                    text: colors.gray[600],
                    border: colors.gray[200]
                };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all h-full"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Compromissos</h3>
                    <p className="text-xl font-black text-gray-900 tracking-tight">Próximos Vencimentos</p>
                </div>
            </div>

            {/* Timeline */}
            {commitments.length > 0 ? (
                <div className="space-y-4">
                    {commitments.map((commitment, idx) => (
                        <motion.div
                            key={`${commitment.description}-${idx}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative"
                        >
                            {/* Timeline Connector */}
                            {idx < commitments.length - 1 && (
                                <div className="absolute left-[15px] top-10 w-0.5 h-full bg-gray-100"></div>
                            )}

                            {/* Commitment Item */}
                            <div className="flex items-start gap-3">
                                {/* Icon Circle */}
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg z-10 border-2"
                                    style={{
                                        backgroundColor: getStatusColor(commitment.status).bg,
                                        color: getStatusColor(commitment.status).text,
                                        borderColor: getStatusColor(commitment.status).border,
                                    }}
                                >
                                    {commitment.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">
                                                {formatDate(commitment.date)}
                                            </p>
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {commitment.description}
                                            </p>
                                        </div>
                                        <span className="text-sm font-black text-gray-900 whitespace-nowrap">
                                            {formatCurrency(commitment.amount)}
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mt-2">
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                            style={{
                                                backgroundColor: getStatusColor(commitment.status).bg,
                                                color: getStatusColor(commitment.status).text,
                                                border: `1px solid ${getStatusColor(commitment.status).border}`,
                                            }}
                                        >
                                            {commitment.status === 'paid' && '✓ Pago'}
                                            {commitment.status === 'urgent' && '! Urgente'}
                                            {commitment.status === 'upcoming' && '◷ Agendado'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <i className="fas fa-calendar-alt text-5xl mb-4 opacity-20"></i>
                    <p className="text-sm font-bold">Nenhuma conta cadastrada</p>
                    <p className="text-xs mt-1 text-center">Cadastre suas contas fixas para ver os vencimentos</p>
                </div>
            )}

            {/* Summary Footer */}
            {commitments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            Total a Pagar
                        </span>
                        <span className="text-lg font-black text-red-600">
                            {formatCurrency(
                                commitments
                                    .filter(c => c.status !== 'paid')
                                    .reduce((sum, c) => sum + c.amount, 0)
                            )}
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default CommitmentRadarCard;
