
import React from 'react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md text-center">
        <div className="p-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
                <i className="fas fa-users text-2xl text-blue-600 dark:text-blue-300"></i>
            </div>
            <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">Funcionalidade em Breve!</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Estamos trabalhando para permitir que você convide outros usuários para gerenciar finanças em conjunto. Fique ligado nas próximas atualizações!
            </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
