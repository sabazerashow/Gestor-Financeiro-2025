import React from 'react';

interface PayBillChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuick: () => void;
  onSelectManual: () => void;
}

const PayBillChoiceModal: React.FC<PayBillChoiceModalProps> = ({ isOpen, onClose, onSelectQuick, onSelectManual }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">Como deseja lançar o pagamento?</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 text-center">
            Escolha um método para registrar esta conta.
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 space-y-3">
             <button
                onClick={onSelectQuick}
                className="w-full text-left p-4 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center"
            >
                <i className="fas fa-bolt text-xl text-green-500 mr-4"></i>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Lançamento Rápido (IA)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Descreva o pagamento e deixe a IA preencher os detalhes.</p>
                </div>
            </button>
             <button
                onClick={onSelectManual}
                className="w-full text-left p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center"
            >
                <i className="fas fa-keyboard text-xl text-blue-500 mr-4"></i>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Lançamento Manual</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Preencha os campos do formulário diretamente.</p>
                </div>
            </button>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayBillChoiceModal;
