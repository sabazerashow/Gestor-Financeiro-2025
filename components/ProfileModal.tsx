
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
  const [editableProfile, setEditableProfile] = useState<ProfileData | null>(userProfile);
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
    if (!editableProfile) return;
    setEditableProfile(prev => prev ? ({ ...prev, [name]: value }) : null);
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
        if (event.target?.result && editableProfile) {
          setEditableProfile(prev => prev ? ({ ...prev, photo: event.target.result as string }) : null);
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

  if (!isOpen || !editableProfile) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--card)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[var(--border)] animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-[var(--color-text)] uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-user-circle text-[var(--primary)] text-2xl"></i>
              Meu Perfil
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-2 hover:bg-[var(--surface)] rounded-full transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

          <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-[var(--border)]">
            <div className="relative group">
              <img
                src={editableProfile?.photo || '/default-avatar.png'}
                alt="Profile"
                className="h-32 w-32 rounded-3xl object-cover ring-4 ring-[var(--surface)] shadow-xl group-hover:scale-105 transition-transform duration-500"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png,image/jpeg,image/webp"
              />
              <button onClick={handlePhotoUploadClick} className="absolute bottom-0 right-0 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full h-8 w-8 flex items-center justify-center hover:bg-[var(--primary-hover)] ring-2 ring-[var(--primary-foreground)] transition-all shadow-md" title="Alterar foto">
                <i className="fas fa-camera text-sm"></i>
              </button>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-text)]">{editableProfile?.name || 'Usuário'}</h3>
              <p className="text-[var(--color-text-muted)]">{editableProfile?.title || 'Cargo/Posto'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text-muted)]">Nome Completo</label>
              <input type="text" id="name" name="name" value={editableProfile.name} onChange={handleInputChange} className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm" />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[var(--color-text-muted)]">Posto/Graduação</label>
              <input type="text" id="title" name="title" value={editableProfile.title} onChange={handleInputChange} className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm" />
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-[var(--color-text-muted)]">Data de Nascimento</label>
              <input type="date" id="dob" name="dob" value={editableProfile.dob} onChange={handleInputChange} className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm" />
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
              <input type="email" value={editableProfile.email} readOnly className="mt-1 block w-full bg-[var(--surface)]/50 border border-[var(--border)] rounded-md p-2 text-xs text-[var(--color-text-muted)] cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-[var(--surface)]/50 border-t border-[var(--border)] flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold rounded-xl text-[var(--color-text)] bg-[var(--card)] hover:bg-[var(--surface)] border border-[var(--border)] transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-bold rounded-xl text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-[var(--primary)]/20 active:scale-95"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
