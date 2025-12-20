
import React, { useState } from 'react';

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
    <button
        onClick={onClick}
        className={`w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 mb-2 ${isActive
            ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
        title={isCollapsed ? label : ''}
    >
        <i className={`fas ${icon} text-lg ${isCollapsed ? 'mx-auto' : 'mr-4'} ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}></i>
        {!isCollapsed && <span className="truncate tracking-tight">{label}</span>}
    </button>
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
        <aside
            className={`flex flex-col h-screen bg-[#111111] transition-all duration-300 sticky top-0 z-40 border-r border-white/5 ${isCollapsed ? 'w-24' : 'w-72'
                }`}
        >
            <div className="p-8 pb-12">
                {!isCollapsed ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[var(--primary)]/20">
                            <i className="fas fa-plane-up text-lg"></i>
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-tight">
                                FINANCE<br /><span className="text-[var(--primary)]">PILOT</span>
                            </h1>
                        </div>
                    </div>
                ) : (
                    <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center mx-auto text-white shadow-lg shadow-[var(--primary)]/20 cursor-pointer" onClick={() => setIsCollapsed(false)}>
                        <i className="fas fa-plane-up text-xl"></i>
                    </div>
                )}
            </div>

            {/* Navigation items */}
            <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                    <SidebarItem
                        label="Visão Geral" icon="fa-border-all"
                        isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        label="Lançamentos" icon="fa-arrow-right-arrow-left"
                        isActive={activeTab === 'history'} onClick={() => setActiveTab('history')}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        label="Contas" icon="fa-file-invoice-dollar"
                        isActive={activeTab === 'bills'} onClick={() => setActiveTab('bills')}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        label="Relatórios" icon="fa-chart-pie"
                        isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')}
                        isCollapsed={isCollapsed}
                    />
                    <SidebarItem
                        label="Análise BP" icon="fa-bullseye"
                        isActive={activeTab === 'bp-analysis'} onClick={() => setActiveTab('bp-analysis')}
                        isCollapsed={isCollapsed}
                    />
                    <div className="h-px w-full bg-white/5 my-4"></div>
                    <SidebarItem
                        label="Conta Família" icon="fa-users"
                        isActive={false} onClick={onOpenInvite}
                        isCollapsed={isCollapsed}
                    />
                </div>
            </nav>

            {/* Bottom Section */}
            <div className="p-4 space-y-4">
                <button
                    onClick={onLogoutClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all"
                >
                    <i className="fas fa-arrow-right-from-bracket text-lg"></i>
                    {!isCollapsed && <span>Logout</span>}
                </button>

                <div
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group`}
                    onClick={onOpenProfile}
                >
                    <div className="relative">
                        {userProfile.photo && userProfile.photo !== defaultPhotoUrl ? (
                            <img src={userProfile.photo} alt="P" className="w-11 h-11 rounded-full object-cover border-2 border-white/10 group-hover:border-[var(--primary)]/50 transition-all" />
                        ) : (
                            <div className="w-11 h-11 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-lg border-2 border-white/10 group-hover:border-[var(--primary)]/50">
                                {userProfile.name.charAt(0)}
                            </div>
                        )}
                        {/* Status Dot */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#111111] shadow-sm flex items-center justify-center ${isAuthActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                            {isAuthActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{userProfile.name}</p>
                            <div className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${isAuthActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                                <span className={`w-1 h-1 rounded-full ${isAuthActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
                                {isAuthActive ? 'Conectado (Nuvem)' : 'Modo Local'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse Toggle Button (Subtle) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 bg-[#111111] border border-white/10 w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:text-white shadow-xl z-50 transition-all"
            >
                <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'} text-[10px]`}></i>
            </button>
        </aside>
    );
};

export default Sidebar;
