import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

interface ProfileData {
    name: string;
    photo: string;
    title?: string;
}

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    userProfile: ProfileData;
    onOpenProfile: () => void;
    onOpenInvite: () => void;
    onLogoutClick?: () => void;
    isAuthActive?: boolean;
    accountName?: string;
    onPurgeAll?: () => void;
    onQuickAdd: () => void;
}

const SidebarItem: React.FC<{
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
    isCollapsed: boolean;
}> = ({ label, icon, isActive, onClick, isCollapsed }) => (
    <motion.button
        whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`w-full group flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 mb-2 border border-transparent ${isActive
            ? 'text-white border-white/5 shadow-none'
            : 'text-gray-400 hover:text-white'
            }`}
        title={isCollapsed ? label : ''}
    >
        <div className={`flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'w-full' : 'mr-4'}`}>
            <i className={`fas ${icon} text-lg ${isActive ? 'text-[var(--primary)]' : 'text-gray-500 group-hover:text-[var(--primary)]'}`}></i>
        </div>
        {!isCollapsed && (
            <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="truncate tracking-tight"
            >
                {label}
            </motion.span>
        )}
        {isActive && !isCollapsed && (
            <motion.div
                layoutId="activeIndicator"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm"
            />
        )}
    </motion.button>
);

const Sidebar: React.FC<SidebarProps> = ({
    activeTab,
    setActiveTab,
    userProfile,
    onOpenProfile,
    onOpenInvite,
    onLogoutClick,
    isAuthActive,
    accountName,
    onPurgeAll,
    onQuickAdd
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const defaultPhotoUrl = 'https://i.ibb.co/6n20d5w/placeholder-profile.png';

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 120 : 320 }}
            className="flex flex-col h-screen bg-[#0A0A0A] sticky top-0 z-40 border-r border-white-[0.05] shadow-[10px_0_30px_-15px_rgba(0,0,0,0.5)]"
        >
            <div className={`transition-all duration-300 ${isCollapsed ? 'px-4 py-8' : 'p-8'} pb-10`}>
                <AnimatePresence mode="wait">
                    {!isCollapsed ? (
                        <motion.div
                            key="full-logo"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-14 h-14 bg-white/5 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl ring-1 ring-white/10">
                                <Logo size={52} color="white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-[0.1em] text-white uppercase leading-[0.8]">
                                    FINANCE<br /><span className="text-[var(--primary)] text-sm tracking-[0.2em] font-black">PILOT</span>
                                </h1>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="collapsed-logo"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-white shadow-2xl ring-1 ring-white/10 cursor-pointer"
                            onClick={() => setIsCollapsed(false)}
                        >
                            <Logo size={60} color="white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar scrollbar-hide py-2">
                <div className="space-y-1.5">
                    <SidebarItem
                        label="Visão Geral" icon="fa-house"
                        isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        label="Transações" icon="fa-receipt"
                        isActive={activeTab === 'history'} onClick={() => setActiveTab('history')}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        label="Contas Fixo" icon="fa-calendar-check"
                        isActive={activeTab === 'bills'} onClick={() => setActiveTab('bills')}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        label="Relatórios" icon="fa-chart-column"
                        isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')}
                        isCollapsed={isCollapsed}
                    />
                    <div className="px-4 py-2">
                        {!isCollapsed && <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Planejamento</p>}
                        {isCollapsed && <div className="h-px bg-white/5 w-full mx-auto"></div>}
                    </div>
                    <SidebarItem
                        label="Orçamentos" icon="fa-sack-dollar"
                        isActive={activeTab === 'budgets'} onClick={() => setActiveTab('budgets')}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        label="Metas" icon="fa-crosshairs"
                        isActive={activeTab === 'goals'} onClick={() => setActiveTab('goals')}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        label="BP Analysis" icon="fa-wand-magic-sparkles"
                        isActive={activeTab === 'bp-analysis'} onClick={() => setActiveTab('bp-analysis')}
                        isCollapsed={isCollapsed}
                    />
                    <div className="h-px w-full bg-white/5 my-4"></div>
                    <SidebarItem
                        label="Conta Família" icon="fa-user-group"
                        isActive={false} onClick={onOpenInvite}
                        isCollapsed={isCollapsed}
                    />
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="p-4 space-y-4">
                <motion.button
                    whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                    onClick={onLogoutClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 rounded-xl transition-all"
                >
                    <div className={`flex items-center justify-center ${isCollapsed ? 'w-full' : 'mr-1'}`}>
                        <i className="fas fa-power-off text-lg"></i>
                    </div>
                    {!isCollapsed && <span>Sair do Sistema</span>}
                </motion.button>

                <motion.div
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    className={`flex items-center ${isCollapsed ? 'justify-center py-4' : 'gap-4 p-4'} rounded-[1.5rem] bg-white/[0.02] border border-white/[0.05] transition-all cursor-pointer group relative overflow-hidden`}
                    onClick={onOpenProfile}
                >
                    <div className="relative z-10">
                        {userProfile?.photo && userProfile.photo !== defaultPhotoUrl ? (
                            <img src={userProfile?.photo || defaultPhotoUrl} alt="P" className="w-12 h-12 rounded-[1rem] object-cover border-2 border-white/10 group-hover:border-[var(--primary)]/50 transition-all shadow-xl" />
                        ) : (
                            <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-black text-xl border-2 border-white/10 group-hover:border-[var(--primary)]/50 shadow-xl">
                                {userProfile?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        {/* Status Dot */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-[#0A0A0A] shadow-sm flex items-center justify-center ${isAuthActive ? 'bg-emerald-500' : 'bg-gray-500'}`}>
                            {isAuthActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 z-10">
                            <p className="text-sm font-black text-white truncate leading-none mb-1">{userProfile?.name || 'Visitante'}</p>
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isAuthActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                                {isAuthActive ? 'Sincronizado' : 'Offline'}
                            </div>
                        </div>
                    )}

                    {/* Hover Glow */}
                    {!isCollapsed && <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)] opacity-0 group-hover:opacity-[0.05] blur-3xl rounded-full -mr-12 -mt-12 transition-opacity duration-500"></div>}
                </motion.div>
            </div>

            {/* Collapse Toggle Button (Subtle & Floating) */}
            <motion.button
                whileHover={{ scale: 1.1, backgroundColor: '#ffffff', color: '#000000' }}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-4 top-24 bg-[#0A0A0A] border border-white/10 w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 shadow-2xl shadow-black z-50 transition-all"
            >
                <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'} text-[10px]`}></i>
            </motion.button>
        </motion.aside>
    );
};

export default Sidebar;
