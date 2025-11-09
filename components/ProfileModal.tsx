

import React, { useState, useRef, useEffect } from 'react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setEditableProfile(prev => ({ ...prev, photo: event.target.result as string }));
            }
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    onSave(editableProfile);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Editar Perfil</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <img 
                        src={editableProfile.photo}
                        alt="Foto do Perfil" 
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-300 dark:ring-indigo-700"
                    />
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <button onClick={handlePhotoUploadClick} className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-indigo-700 ring-2 ring-white dark:ring-gray-800" title="Alterar foto">
                       <i className="fas fa-camera text-sm"></i>
                    </button>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{editableProfile.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{editableProfile.title}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Nome Completo</label>
                    <input type="text" id="name" name="name" value={editableProfile.name} onChange={handleInputChange} className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                </div>
                 <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Posto/Graduação</label>
                    <input type="text" id="title" name="title" value={editableProfile.title} onChange={handleInputChange} className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Data de Nascimento</label>
                    <input type="date" id="dob" name="dob" value={editableProfile.dob} onChange={handleInputChange} className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                </div>
                 <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Sexo</label>
                    <select id="gender" name="gender" value={editableProfile.gender} onChange={handleInputChange} className="mt-1 block w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option>Masculino</option>
                        <option>Feminino</option>
                        <option>Outro</option>
                    </select>
                </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">E-mail</label>
                    <input type="email" value={editableProfile.email} readOnly className="mt-1 block w-full bg-gray-100 dark:bg-gray-900/50 border-gray-200 dark:border-gray-600 rounded-md p-2 text-sm text-gray-400 cursor-not-allowed"/>
                </div>
            </div>

        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;