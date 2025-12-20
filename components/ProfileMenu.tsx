

import React, { useState } from 'react';

interface ProfileMenuProps {
  onProfileClick: () => void;
  onInviteClick: () => void;
  onSettingsClick: () => void;
  onSecurityClick: () => void;
  onLogoutClick: () => void;
  onPurgeClick?: () => void;
}


const ProfileMenu: React.FC<ProfileMenuProps> = ({ onProfileClick, onInviteClick, onSettingsClick, onSecurityClick, onLogoutClick, onPurgeClick }) => {

  return (
    <div
      className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[var(--card)] ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100 transform opacity-100 scale-100"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
    >
      <div className="py-1" role="none">
        <a href="#" onClick={(e) => { e.preventDefault(); onProfileClick(); }} className="text-[var(--color-text)] block px-4 py-2 text-sm hover:bg-[var(--surface)] transition-colors" role="menuitem">
          <i className="fas fa-user-circle w-5 mr-2 text-[var(--primary)] opacity-70"></i>
          Meu Perfil
        </a>

        <a href="#" onClick={(e) => { e.preventDefault(); onInviteClick(); }} className="text-[var(--color-text)] block px-4 py-2 text-sm hover:bg-[var(--surface)] transition-colors" role="menuitem">
          <i className="fas fa-user-plus w-5 mr-2 text-[var(--primary)] opacity-70"></i>
          Convidar usuários
        </a>

        <a href="#" onClick={(e) => { e.preventDefault(); onSecurityClick(); }} className="text-[var(--color-text)] block px-4 py-2 text-sm hover:bg-[var(--surface)] transition-colors" role="menuitem">
          <i className="fas fa-shield-halved w-5 mr-2 text-[var(--primary)] opacity-70"></i>
          Segurança
        </a>

        <a href="#" onClick={(e) => { e.preventDefault(); onSettingsClick(); }} className="text-[var(--color-text)] block px-4 py-2 text-sm hover:bg-[var(--surface)] transition-colors" role="menuitem">
          <i className="fas fa-cog w-5 mr-2 text-[var(--primary)] opacity-70"></i>
          Configurações
        </a>
      </div>
      <div className="border-t border-[var(--border)]"></div>
      <div className="py-1" role="none">
        {onPurgeClick && (
          <a href="#" onClick={(e) => { e.preventDefault(); onPurgeClick(); }} className="text-[var(--destructive)] block px-4 py-2 text-sm hover:bg-[var(--destructive)]/10" role="menuitem">
            <i className="fas fa-trash-alt w-5 mr-2"></i>
            Apagar todos os dados
          </a>
        )}
        <a href="#" onClick={(e) => { e.preventDefault(); onLogoutClick(); }} className="text-[var(--color-text)] block px-4 py-2 text-sm hover:bg-[var(--surface)]" role="menuitem">
          <i className="fas fa-sign-out-alt w-5 mr-2"></i>
          Logout
        </a>
      </div>
    </div>
  );
};

export default ProfileMenu;
