

import React, { useState } from 'react';

interface ProfileMenuProps {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  onProfileClick: () => void;
  onInviteClick: () => void;
  onLogoutClick: () => void;
  onPurgeClick?: () => void;
}

const ThemeOption: React.FC<{ label: string; icon: string; currentTheme: string; themeValue: string; onClick: () => void; }> = 
({ label, icon, currentTheme, themeValue, onClick }) => (
    <button onClick={onClick} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between">
        <div className="flex items-center">
            <i className={`fas ${icon} w-5 mr-2`}></i>
            <span>{label}</span>
        </div>
        {currentTheme === themeValue && <i className="fas fa-check text-indigo-500"></i>}
    </button>
);


const ProfileMenu: React.FC<ProfileMenuProps> = ({ theme, setTheme, onProfileClick, onInviteClick, onLogoutClick, onPurgeClick }) => {
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  return (
    <div
      className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100 transform opacity-100 scale-100"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
    >
      <div className="py-1" role="none">
        <a href="#" onClick={(e) => { e.preventDefault(); onProfileClick(); }} className="text-gray-700 dark:text-gray-200 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
          <i className="fas fa-user-edit w-5 mr-2"></i>
          Perfil
        </a>
        <div className="relative" onMouseEnter={() => setIsThemeMenuOpen(true)} onMouseLeave={() => setIsThemeMenuOpen(false)}>
            <button className="w-full text-left text-gray-700 dark:text-gray-200 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center" role="menuitem">
              <div>
                <i className="fas fa-palette w-5 mr-2"></i>
                Tema
              </div>
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
            {isThemeMenuOpen && (
                 <div className="absolute right-full top-0 mt-[-8px] mr-1 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                     <div className="py-1">
                        <ThemeOption label="Claro" icon="fa-sun" currentTheme={theme} themeValue="light" onClick={() => setTheme('light')} />
                        <ThemeOption label="Escuro" icon="fa-moon" currentTheme={theme} themeValue="dark" onClick={() => setTheme('dark')} />
                        <ThemeOption label="Automático" icon="fa-desktop" currentTheme={theme} themeValue="auto" onClick={() => setTheme('auto')} />
                     </div>
                 </div>
            )}
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); onInviteClick(); }} className="text-gray-700 dark:text-gray-200 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
          <i className="fas fa-user-plus w-5 mr-2"></i>
          Convidar usuários
        </a>
      </div>
      <div className="border-t border-gray-100 dark:border-gray-700"></div>
      <div className="py-1" role="none">
        {onPurgeClick && (
          <a href="#" onClick={(e) => { e.preventDefault(); onPurgeClick(); }} className="text-red-600 dark:text-red-400 block px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/30" role="menuitem">
            <i className="fas fa-trash-alt w-5 mr-2"></i>
            Apagar todos os dados
          </a>
        )}
        <a href="#" onClick={(e) => { e.preventDefault(); onLogoutClick(); }} className="text-gray-700 dark:text-gray-200 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
          <i className="fas fa-sign-out-alt w-5 mr-2"></i>
          Logout
        </a>
      </div>
    </div>
  );
};

export default ProfileMenu;
