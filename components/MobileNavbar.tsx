import React from 'react';
import { motion } from 'framer-motion';

interface MobileNavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onQuickAdd: () => void;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ activeTab, setActiveTab, onQuickAdd }) => {
    const navItems = [
        { id: 'overview', icon: 'fa-house', label: 'Início' },
        { id: 'history', icon: 'fa-receipt', label: 'Extrato' },
        { id: 'quick-add', icon: 'fa-plus', label: 'Novo', isCenter: true },
        { id: 'bills', icon: 'fa-calendar-check', label: 'Contas' },
        { id: 'reports', icon: 'fa-chart-column', label: 'Relatórios' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pointer-events-none">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] shadow-2xl flex items-center justify-around p-2 pointer-events-auto backdrop-blur-xl">
                {navItems.map((item) => {
                    if (item.id === 'quick-add') {
                        return (
                            <button
                                key={item.id}
                                onClick={onQuickAdd}
                                className="w-14 h-14 bg-[var(--primary)] text-white rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary)]/30 active:scale-95 transition-all -mt-4 border-4 border-[var(--background)]"
                            >
                                <i className={`fas ${item.icon} text-xl`}></i>
                            </button>
                        );
                    }

                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="flex flex-col items-center gap-1 py-1 px-3 relative"
                        >
                            <i className={`fas ${item.icon} text-lg transition-all ${isActive ? 'text-[var(--primary)]' : 'text-gray-500'}`}></i>
                            <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="mobNavIndicator"
                                    className="absolute -top-1 w-1 h-1 rounded-full bg-[var(--primary)]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileNavbar;
