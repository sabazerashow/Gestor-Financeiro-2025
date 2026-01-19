import React, { useState } from 'react';
import { Bill } from '../types';
import { getSubscriptionStatus } from '../lib/subscriptionHelpers';
import { getProviderInfo } from '../lib/providerLogos';

interface SubscriptionCalendarProps {
    bills: Bill[];
    onBillClick?: (bill: Bill) => void;
}

const SubscriptionCalendar: React.FC<SubscriptionCalendarProps> = ({ bills, onBillClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const currentDay = isCurrentMonth ? today.getDate() : -1;

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Agrupa contas por dia
    const billsByDay: Record<number, Bill[]> = {};
    bills.forEach(bill => {
        if (bill.dueDay >= 1 && bill.dueDay <= 31) {
            if (!billsByDay[bill.dueDay]) {
                billsByDay[bill.dueDay] = [];
            }
            billsByDay[bill.dueDay].push(bill);
        }
    });

    return (
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-6">
            {/* Header do calendário */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <i className="fas fa-calendar-days"></i>
                    </div>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Calendário de Vencimentos</h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex items-center justify-center"
                        aria-label="Mês anterior"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>

                    <button
                        onClick={goToToday}
                        className="px-4 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                    >
                        Hoje
                    </button>

                    <button
                        onClick={goToNextMonth}
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex items-center justify-center"
                        aria-label="Próximo mês"
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            {/* Nome do mês */}
            <div className="mb-6">
                <h3 className="text-3xl font-black text-gray-800">{monthNames[month]} {year}</h3>
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-xs text-gray-600">Pago</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-400"></div>
                    <span className="text-xs text-gray-600">A Vencer</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-xs text-gray-600">Atrasado</span>
                </div>
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dayBills = billsByDay[day] || [];
                    const isToday = day === currentDay;

                    return (
                        <div
                            key={day}
                            className={`relative aspect-square rounded-2xl border-2 transition-all ${isToday
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                                }`}
                        >
                            {/* Número do dia */}
                            <div className={`absolute top-2 left-2 text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-400'
                                }`}>
                                {day}
                            </div>

                            {/* Ícones das contas */}
                            {dayBills.length > 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-1 pt-6">
                                    {dayBills.slice(0, 3).map(bill => {
                                        const status = getSubscriptionStatus(bill, new Date(year, month, day));
                                        const provider = getProviderInfo(bill.providerLogo);

                                        const statusColor =
                                            status === 'paid'
                                                ? 'bg-green-500'
                                                : status === 'overdue'
                                                    ? 'bg-red-500'
                                                    : 'bg-gray-600';

                                        return (
                                            <button
                                                key={bill.id}
                                                onClick={() => onBillClick?.(bill)}
                                                className={`group relative w-8 h-8 rounded-lg ${statusColor} flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform ${status === 'overdue' ? 'animate-pulse' : ''
                                                    }`}
                                                title={`${bill.description} - R$ ${bill.amount?.toFixed(2)}`}
                                            >
                                                <i className={`${provider.icon} text-xs`}></i>

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    {bill.description}
                                                    <br />
                                                    {bill.amount && `R$ ${bill.amount.toFixed(2)}`}
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {/* Indicador de mais contas */}
                                    {dayBills.length > 3 && (
                                        <div className="text-[10px] font-bold text-gray-500 mt-1">
                                            +{dayBills.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Resumo do mês */}
            <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-black text-green-600">{bills.filter(b => getSubscriptionStatus(b) === 'paid').length}</p>
                        <p className="text-xs text-gray-500 mt-1">Pagas</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-gray-600">{bills.filter(b => getSubscriptionStatus(b) === 'pending').length}</p>
                        <p className="text-xs text-gray-500 mt-1">A Vencer</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-red-600">{bills.filter(b => getSubscriptionStatus(b) === 'overdue').length}</p>
                        <p className="text-xs text-gray-500 mt-1">Atrasadas</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionCalendar;
