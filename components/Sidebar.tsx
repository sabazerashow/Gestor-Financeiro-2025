
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
            {/* Logo Area */}
            <div className="p-8 pb-12">
                {!isCollapsed ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white">
                            <i className="fas fa-wallet text-sm"></i>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white uppercase flex items-center">
                            FINE<span className="text-gray-400">bank.IO</span>
                        </h1>
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center mx-auto text-white">
                        <i className="fas fa-wallet"></i>
                    </div>
                )}
            </div>

            {/* Navigation items */}
            <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                    <SidebarItem
                        label="Visão Geral" icon="fa-grid-2"
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
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{userProfile.name}</p>
                            <p className="text-xs text-gray-500 truncate group-hover:text-gray-300 transition-all">View profile</p>
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
