import React from 'react';
import { Bill } from '../types';
import { getContractAlerts, getContractDaysRemaining } from '../lib/subscriptionHelpers';
import { getProviderInfo } from '../lib/providerLogos';

interface ContractAlertsProps {
    bills: Bill[];
}

const ContractAlerts: React.FC<ContractAlertsProps> = ({ bills }) => {
    const alerts = getContractAlerts(bills, 30);

    if (alerts.length === 0) {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-[32px] border border-green-200 shadow-sm mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-shield-check text-white text-xl"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-green-700">Tudo em ordem! 🎉</h3>
                        <p className="text-sm text-green-600 mt-1">
                            Nenhum contrato de fidelidade vencendo nos próximos 30 dias.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[32px] border border-orange-200 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <i className="fas fa-bell text-orange-600"></i>
                </div>
                <div className="flex-1">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vigilante de Contratos</h2>
                </div>
                <div className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                    {alerts.length} alerta{alerts.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="space-y-3">
                {alerts.map(bill => {
                    const daysRemaining = getContractDaysRemaining(bill.contractEndDate);
                    const provider = getProviderInfo(bill.providerLogo);
                    const isUrgent = daysRemaining !== null && daysRemaining <= 7;

                    return (
                        <div
                            key={bill.id}
                            className={`p-4 rounded-2xl border-2 ${isUrgent
                                    ? 'bg-red-50 border-red-300 animate-pulse'
                                    : 'bg-yellow-50 border-yellow-300'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Ícone do provedor */}
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isUrgent ? 'bg-red-500' : 'bg-yellow-500'
                                        }`}
                                    style={{ backgroundColor: provider.color }}
                                >
                                    <i className={`${provider.icon} text-white`}></i>
                                </div>

                                {/* Conteúdo */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <h3 className={`font-bold ${isUrgent ? 'text-red-700' : 'text-yellow-700'}`}>
                                                {bill.description}
                                            </h3>
                                            <p className={`text-sm mt-1 ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
                                                {isUrgent ? '🚨 ' : '⚠️ '}
                                                Fidelidade vence em <strong>{daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}</strong>
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            {bill.amount && (
                                                <p className="text-lg font-bold text-gray-800">
                                                    R$ {bill.amount.toFixed(2).replace('.', ',')}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">mensal</p>
                                        </div>
                                    </div>

                                    {/* Sugestões de ação */}
                                    <div className="mt-3 pt-3 border-t border-yellow-200">
                                        <p className="text-xs font-bold text-gray-600 mb-2">💡 Sugestões:</p>
                                        <div className="flex flex-wrap gap-2">
                                            <button className="px-3 py-1 bg-white border border-yellow-300 text-yellow-700 text-xs font-semibold rounded-lg hover:bg-yellow-50 transition-colors">
                                                <i className="fas fa-phone mr-1"></i>
                                                Ligar e negociar
                                            </button>
                                            <button className="px-3 py-1 bg-white border border-yellow-300 text-yellow-700 text-xs font-semibold rounded-lg hover:bg-yellow-50 transition-colors">
                                                <i className="fas fa-search mr-1"></i>
                                                Comparar preços
                                            </button>
                                            <button className="px-3 py-1 bg-white border border-yellow-300 text-yellow-700 text-xs font-semibold rounded-lg hover:bg-yellow-50 transition-colors">
                                                <i className="fas fa-times-circle mr-1"></i>
                                                Avaliar cancelamento
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Dica geral */}
            <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-700">
                    <i className="fas fa-lightbulb mr-2"></i>
                    <strong>Dica:</strong> Ao fim do contrato, você pode renegociar descontos de até 50% em muitos serviços!
                </p>
            </div>
        </div>
    );
};

export default ContractAlerts;
