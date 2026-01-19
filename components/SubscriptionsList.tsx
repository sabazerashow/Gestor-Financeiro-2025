import React from 'react';
import { Bill } from '../types';
import { getSubscriptionStatus, calculateTrendPercentage, generateSparklineData, getContractDaysRemaining } from '../lib/subscriptionHelpers';
import { getProviderInfo } from '../lib/providerLogos';

interface SubscriptionsListProps {
    bills: Bill[];
    onMarkAsPaid: (billId: string) => void;
    onEdit: (bill: Bill) => void;
    onDelete: (billId: string) => void;
}

const MiniSparkline: React.FC<{ data: number[] }> = ({ data }) => {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    const isPositive = data[data.length - 1] > data[0];
    const color = isPositive ? '#EF4444' : '#10B981';

    return (
        <svg viewBox="0 0 100 100" className="w-16 h-8" preserveAspectRatio="none">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

const SubscriptionsList: React.FC<SubscriptionsListProps> = ({ bills, onMarkAsPaid, onEdit, onDelete }) => {
    // Ordena por dia de vencimento
    const sortedBills = [...bills].sort((a, b) => a.dueDay - b.dueDay);

    return (
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <i className="fas fa-list-check"></i>
                </div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assinaturas Cadastradas</h2>
            </div>

            {sortedBills.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-inbox text-gray-400 text-2xl"></i>
                    </div>
                    <p className="text-gray-500 font-medium">Nenhuma assinatura cadastrada</p>
                    <p className="text-sm text-gray-400 mt-1">Adicione suas contas fixas e assinaturas aqui</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedBills.map(bill => {
                        const status = getSubscriptionStatus(bill);
                        const provider = getProviderInfo(bill.providerLogo);
                        const trendPercentage = calculateTrendPercentage(bill.amount, bill.lastAmount);
                        const sparklineData = generateSparklineData(bill.amount, bill.lastAmount);
                        const contractDaysRemaining = getContractDaysRemaining(bill.contractEndDate);
                        const hasContractAlert = contractDaysRemaining !== null && contractDaysRemaining > 0 && contractDaysRemaining <= 30;

                        const statusConfig = {
                            paid: { bg: 'bg-green-50', border: 'border-green-200', icon: 'fa-check-circle', iconColor: 'text-green-500' },
                            pending: { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'fa-clock', iconColor: 'text-gray-500' },
                            overdue: { bg: 'bg-red-50', border: 'border-red-300', icon: 'fa-exclamation-circle', iconColor: 'text-red-500' },
                        };

                        const config = statusConfig[status];

                        return (
                            <div
                                key={bill.id}
                                className={`p-4 rounded-2xl border-2 ${config.bg} ${config.border} transition-all hover:shadow-md`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Ícone do provedor */}
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                                        style={{ backgroundColor: provider.color }}
                                    >
                                        <i className={`${provider.icon} text-lg`}></i>
                                    </div>

                                    {/* Conteúdo principal */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            {/* Info da conta */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-800 truncate">{bill.description}</h3>
                                                    {bill.isAutoDebit && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">
                                                            Auto
                                                        </span>
                                                    )}
                                                    {hasContractAlert && (
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded flex items-center gap-1">
                                                            <i className="fas fa-bell"></i>
                                                            {contractDaysRemaining}d
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <i className={`fas ${config.icon} ${config.iconColor} text-xs`}></i>
                                                        Vence dia {String(bill.dueDay).padStart(2, '0')}
                                                    </span>

                                                    {bill.category && (
                                                        <span className="text-xs text-gray-400">• {bill.category}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Valor e tendência */}
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                {/* Sparkline */}
                                                {sparklineData.length > 1 && (
                                                    <div className="flex flex-col items-end">
                                                        <MiniSparkline data={sparklineData} />
                                                        {trendPercentage !== null && (
                                                            <span className={`text-xs font-bold ${trendPercentage > 0 ? 'text-red-600' : 'text-green-600'
                                                                }`}>
                                                                {trendPercentage > 0 ? '⬆️' : '⬇️'} {Math.abs(trendPercentage)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Valor */}
                                                {bill.amount !== undefined && (
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-gray-800">
                                                            R$ {bill.amount.toFixed(2).replace('.', ',')}
                                                        </p>
                                                        <p className="text-xs text-gray-500">mensal</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Links e ações */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                            <div className="flex items-center gap-2">
                                                {bill.paymentUrl && (
                                                    <a
                                                        href={bill.paymentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <i className="fas fa-external-link-alt text-[10px]"></i>
                                                        Pagar online
                                                    </a>
                                                )}
                                                {(bill.paymentUser || bill.paymentPass) && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <i className="fas fa-key text-[10px]"></i>
                                                        Credenciais salvas
                                                    </span>
                                                )}
                                            </div>

                                            {/* Botões de ação */}
                                            <div className="flex items-center gap-2">
                                                {status !== 'paid' && (
                                                    <button
                                                        onClick={() => onMarkAsPaid(bill.id)}
                                                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                                    >
                                                        <i className="fas fa-check"></i>
                                                        Marcar como Pago
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => onEdit(bill)}
                                                    className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors flex items-center justify-center"
                                                    aria-label="Editar"
                                                >
                                                    <i className="fas fa-edit text-xs"></i>
                                                </button>

                                                <button
                                                    onClick={() => onDelete(bill.id)}
                                                    className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors flex items-center justify-center"
                                                    aria-label="Deletar"
                                                >
                                                    <i className="fas fa-trash-alt text-xs"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SubscriptionsList;
