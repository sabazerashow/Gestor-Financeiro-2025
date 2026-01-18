import React from 'react';
import { motion } from 'framer-motion';
import { colors, typography } from '../lib/designSystem';

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
            {/* Saudação Profissional */}
            <div className="flex items-center gap-4">
                <div>
                    <h1
                        className="font-bold tracking-tight"
                        style={{
                            fontSize: '24px',
                            color: colors.gray[900],
                        }}
                    >
                        Olá, {userName}
                    </h1>
                    <p
                        className="font-medium"
                        style={{
                            fontSize: typography.caption.size,
                            color: colors.gray[500],
                        }}
                    >
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
                {/* Botão Notificações */}
                {onOpenNotifications && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenNotifications}
                        className="relative w-11 h-11 rounded-xl border shadow-sm hover:shadow-md flex items-center justify-center transition-all"
                        style={{
                            backgroundColor: colors.background.secondary,
                            borderColor: colors.gray[200],
                            color: colors.gray[600],
                        }}
                    >
                        <i className="fas fa-bell text-lg"></i>
                        {notificationCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md"
                                style={{ backgroundColor: colors.danger }}
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
