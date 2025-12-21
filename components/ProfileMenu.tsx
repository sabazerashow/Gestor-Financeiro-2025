

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
      className="w-full rounded-[1.5rem] shadow-2xl bg-[#1A1A1A] border border-white/10 focus:outline-none transition-all duration-200"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
    >
      <div className="py-1" role="none">
        <a href="#" onClick={(e) => { e.preventDefault(); onProfileClick(); }} className="text-gray-300 block px-4 py-3 text-sm hover:bg-white/5 hover:text-white transition-all font-bold" role="menuitem">
          <i className="fas fa-user-circle w-5 mr-3 text-[var(--primary)] opacity-80"></i>
          Meu Perfil
        </a>

        <a href="#" onClick={(e) => { e.preventDefault(); onInviteClick(); }} className="text-gray-300 block px-4 py-3 text-sm hover:bg-white/5 hover:text-white transition-all font-bold" role="menuitem">
          <i className="fas fa-user-plus w-5 mr-3 text-[var(--primary)] opacity-80"></i>
          Convidar usuários
        </a>

        <a href="#" onClick={(e) => { e.preventDefault(); onSecurityClick(); }} className="text-gray-300 block px-4 py-3 text-sm hover:bg-white/5 hover:text-white transition-all font-bold" role="menuitem">
          <i className="fas fa-shield-halved w-5 mr-3 text-[var(--primary)] opacity-80"></i>
          Segurança
        </a>

        <a href="#" onClick={(e) => { e.preventDefault(); onSettingsClick(); }} className="text-gray-300 block px-4 py-3 text-sm hover:bg-white/5 hover:text-white transition-all font-bold" role="menuitem">
          <i className="fas fa-cog w-5 mr-3 text-[var(--primary)] opacity-80"></i>
          Configurações
        </a>
      </div>
      <div className="border-t border-[var(--border)]"></div>
      <div className="py-2" role="none">
        {onPurgeClick && (
          <a href="#" onClick={(e) => { e.preventDefault(); onPurgeClick(); }} className="text-red-400 font-bold block px-4 py-3 text-sm hover:bg-red-500/10 transition-all" role="menuitem">
            <i className="fas fa-trash-alt w-5 mr-3"></i>
            Apagar todos os dados
          </a>
        )}
        <a href="#" onClick={(e) => { e.preventDefault(); onLogoutClick(); }} className="text-gray-300 font-bold block px-4 py-3 text-sm hover:bg-white/5 hover:text-white transition-all" role="menuitem">
          <i className="fas fa-sign-out-alt w-5 mr-3"></i>
          Logout
        </a>
      </div>
    </div>
  );
};

export default ProfileMenu;
