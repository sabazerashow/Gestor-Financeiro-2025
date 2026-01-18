import React from 'react';
import { motion } from 'framer-motion';

interface ActiveHeaderProps {
    userName: string;
    notificationCount?: number;
    onOpenIncomeModal: () => void;
    onOpenExpenseModal: () => void;
    onOpenNotifications?: () => void;
}

const ActiveHeader: React.FC<ActiveHeaderProps> = ({
    userName,
    notificationCount = 0,
    onOpenIncomeModal,
    onOpenExpenseModal,
    onOpenNotifications
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6"
        >
            {/* Saudação Personalizada */}
            <div className="flex items-center gap-3">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="text-3xl"
                >
                    👋
                </motion.div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                        Olá, {userName}
                    </h1>
                    <p className="text-xs text-gray-400 font-medium">
                        {new Date().toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Ações Rápidas */}
            <div className="flex items-center gap-3">
                {/* Botão Receita */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onOpenIncomeModal}
                    className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-all font-bold text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                >
                    <i className="fas fa-arrow-up text-xs"></i>
                    <span>Receita</span>
                </motion.button>

                {/* Botão Despesa */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onOpenExpenseModal}
                    className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all font-bold text-sm shadow-sm hover:shadow-md flex items-center gap-2"
                >
                    <i className="fas fa-arrow-down text-xs"></i>
                    <span>Despesa</span>
                </motion.button>

                {/* Botão Notificações */}
                {onOpenNotifications && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenNotifications}
                        className="relative w-11 h-11 bg-gray-50 text-gray-600 rounded-xl border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all shadow-sm hover:shadow-md flex items-center justify-center"
                    >
                        <i className="fas fa-bell text-lg"></i>
                        {notificationCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md"
                            >
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </motion.span>
                        )}
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default ActiveHeader;
