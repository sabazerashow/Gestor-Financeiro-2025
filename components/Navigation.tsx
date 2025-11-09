import React from 'react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickAdd: () => void;
}

const NavButton: React.FC<{tabName: string; label: string; icon: string; isActive: boolean; onClick: () => void;}> = ({tabName, label, icon, isActive, onClick}) => (
    <button
      onClick={onClick}
      className={`flex-grow md:flex-grow-0 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <i className={`fas ${icon} w-5 text-center`}></i>
      <span className="hidden md:inline">{label}</span>
    </button>
);


const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, onQuickAdd }) => {
  return (
    <nav className="container mx-auto p-4 sticky top-0 z-10 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 p-2 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg shadow-sm">
            <NavButton tabName="overview" label="Visão Geral" icon="fa-tachometer-alt" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavButton tabName="bills" label="Contas" icon="fa-file-invoice-dollar" isActive={activeTab === 'bills'} onClick={() => setActiveTab('bills')} />
            <NavButton tabName="reports" label="Relatórios" icon="fa-chart-bar" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            <NavButton tabName="bp-analysis" label="Análise BP" icon="fa-money-check-alt" isActive={activeTab === 'bp-analysis'} onClick={() => setActiveTab('bp-analysis')} />
            <NavButton tabName="history" label="Transações" icon="fa-exchange-alt" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            <button
                onClick={onQuickAdd}
                className="flex-grow md:flex-grow-0 px-3 py-2 text-sm font-medium rounded-md transition-colors text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] flex items-center justify-center gap-2 shadow-md"
                >
                <i className="fas fa-bolt"></i>
                <span className="hidden md:inline">Lançamento Rápido</span>
            </button>
        </div>
    </nav>
  );
};

export default Navigation;
