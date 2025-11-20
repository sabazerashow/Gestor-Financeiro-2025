

import React, { useState, useRef, useEffect } from 'react';
import ErrorBanner from './ui/error-banner';

interface ProfileData {
    name: string;
    title: string;
    email: string;
    dob: string;
    gender: string;
    photo: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: ProfileData;
  onSave: (newProfile: ProfileData) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userProfile, onSave }) => {
  const [editableProfile, setEditableProfile] = useState<ProfileData>(userProfile);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB foto de perfil

  useEffect(() => {
    if (isOpen) {
        setEditableProfile(userProfile);
    }
  }, [isOpen, userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const lowerName = file.name.toLowerCase();
        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];
        const isValidType = allowedImageTypes.includes(file.type) || lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.webp');
        if (!isValidType) {
            setError('Formato de imagem não suportado. Permitidos: PNG, JPEG, WEBP.');
            return;
        }
        if (file.size > MAX_IMAGE_SIZE) {
            setError('A imagem excede o limite de 3 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setEditableProfile(prev => ({ ...prev, photo: event.target.result as string }));
                setError(null);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(editableProfile);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--overlay)] z-50 flex justify-center items-center p-4">
      <div className="bg-[var(--card)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--color-text)]">Editar Perfil</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
            {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <img 
                        src={editableProfile.photo}
                        alt="Foto do Perfil" 
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--primary)]/30"
                    />
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png,image/jpeg,image/webp"
                    />
                    <button onClick={handlePhotoUploadClick} className="absolute bottom-0 right-0 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full h-8 w-8 flex items-center justify-center hover:bg-[var(--primary-hover)] ring-2 ring-[var(--primary-foreground)]" title="Alterar foto">
                       <i className="fas fa-camera text-sm"></i>
                    </button>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-[var(--color-text)]">{editableProfile.name}</h3>
                    <p className="text-[var(--color-text-muted)]">{editableProfile.title}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-muted)]">Nome Completo</label>
                    <input type="text" id="name" name="name" value={editableProfile.name} onChange={handleInputChange} className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm"/>
                </div>
                 <div>
                    <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text-muted)]">Posto/Graduação</label>
                    <input type="text" id="title" name="title" value={editableProfile.title} onChange={handleInputChange} className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-[var(--color-text-muted)]">Data de Nascimento</label>
                    <input type="date" id="dob" name="dob" value={editableProfile.dob} onChange={handleInputChange} className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm"/>
                </div>
                 <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-[var(--color-text-muted)]">Sexo</label>
                    <select id="gender" name="gender" value={editableProfile.gender} onChange={handleInputChange} className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm">
                        <option>Masculino</option>
                        <option>Feminino</option>
                        <option>Outro</option>
                    </select>
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--color-text-muted)]">E-mail</label>
                    <input type="email" value={editableProfile.email} readOnly className="mt-1 block w-full bg-[var(--surface)]/50 border-[var(--border)] rounded-md p-2 text-sm text-[var(--color-text-muted)] cursor-not-allowed"/>
                </div>
            </div>

        </div>
        
        <div className="p-4 bg-[var(--surface)]/50 border-t border-[var(--border)] flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--color-text)] bg-[var(--card)] hover:bg-[var(--surface)] border border-[var(--border)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
