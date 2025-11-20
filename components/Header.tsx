

import React, { useState, useEffect, useRef } from 'react';
import ProfileMenu from './ProfileMenu';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

interface ProfileData {
    name: string;
    photo: string;
}

interface HeaderProps {
    theme: 'light' | 'dark' | 'auto';
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onQuickAdd: () => void;
    userProfile: ProfileData;
    onOpenProfile: () => void;
    onOpenInvite: () => void;
    onLogoutClick?: () => void;
    accountName?: string;
    onOpenAccountSwitch?: () => void;
    onPurgeAll?: () => void;
}

const NavButton: React.FC<{label: string; icon: string; isActive: boolean; onClick: () => void;}> = ({label, icon, isActive, onClick}) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
        isActive
          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
          : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]/60 hover:text-[var(--color-text)]'
      }`}
    >
      <i className={`fas ${icon} w-5 text-center`}></i>
      <span className="hidden md:inline">{label}</span>
    </button>
);


const Header: React.FC<HeaderProps> = ({ theme, setTheme, activeTab, setActiveTab, onQuickAdd, userProfile, onOpenProfile, onOpenInvite, onLogoutClick, accountName, onOpenAccountSwitch, onPurgeAll }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const defaultPhotoUrl = 'https://i.ibb.co/6n20d5w/placeholder-profile.png';
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsProfileMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
    
  return (
    <header className="bg-[var(--background)] shadow-lg sticky top-0 z-30">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        
        {/* Left Side: Logo and Title */}
        <div className="flex items-center">
            <div className="text-white mr-3">
              <Logo size={28} />
            </div>
            <h1 className="text-2xl font-bold font-oswald tracking-wider uppercase text-white">
              <span className="hidden md:inline">FINANCE PILOT</span>
              <span className="md:hidden">FP</span>
            </h1>
            {accountName && (
              <button
                onClick={() => (onOpenAccountSwitch ? onOpenAccountSwitch() : onOpenInvite())}
                className="ml-3 px-3 py-1 rounded-md bg-[var(--secondary)]/10 hover:bg-[var(--secondary)]/20 text-[var(--secondary-foreground)] text-sm flex items-center"
                title="Selecionar conta"
              >
                <i className="fas fa-building mr-2"></i>
                <span className="truncate max-w-[14ch]">{accountName}</span>
                <i className="fas fa-chevron-down ml-2 opacity-80"></i>
              </button>
            )}
        </div>
        
        {/* Right Side: Navigation and Actions */}
        <div className="flex items-center space-x-1 md:space-x-2">
            <NavButton label="Visão Geral" icon="fa-tachometer-alt" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavButton label="Contas" icon="fa-file-invoice-dollar" isActive={activeTab === 'bills'} onClick={() => setActiveTab('bills')} />
            <NavButton label="Relatórios" icon="fa-chart-bar" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            <NavButton label="Análise BP" icon="fa-money-check-alt" isActive={activeTab === 'bp-analysis'} onClick={() => setActiveTab('bp-analysis')} />
            <NavButton label="Lançamentos" icon="fa-exchange-alt" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            
            <button
                onClick={onQuickAdd}
                className="px-3 py-2 text-sm font-medium rounded-md transition-colors text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--color-primary-hover)] flex items-center justify-center gap-2"
                >
                <i className="fas fa-bolt"></i>
                <span className="hidden lg:inline">Rápido</span>
            </button>

            <div className="h-6 border-l border-gray-700 mx-1 md:mx-2"></div>

            {/* Theme toggle visible */}
            <ThemeToggle theme={theme} setTheme={setTheme} />

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsProfileMenuOpen(prev => !prev)}
                    className="text-gray-400 hover:text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    aria-label="Abrir menu do perfil"
                >
                   {userProfile.photo && userProfile.photo !== defaultPhotoUrl ? (
                        <img src={userProfile.photo} alt="Foto do Perfil" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <i className="fas fa-user-circle text-2xl"></i>
                    )}
                </button>
                {isProfileMenuOpen && (
                    <ProfileMenu
                        theme={theme}
                        setTheme={setTheme}
                        onProfileClick={() => { setIsProfileMenuOpen(false); onOpenProfile(); }}
                        onInviteClick={() => { setIsProfileMenuOpen(false); onOpenInvite(); }}
                        onLogoutClick={() => { setIsProfileMenuOpen(false); onLogoutClick?.(); }}
                        onPurgeClick={() => { setIsProfileMenuOpen(false); onPurgeAll?.(); }}
                    />
                )}
            </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
