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
      <div className="bg-[var(--card)] rounded-xl shadow-2xl w-full max-w-sm">
        <div className="p-6">
          <h3 className="text-lg font-bold text-[var(--color-text)] text-center">Como deseja lançar o pagamento?</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)] text-center">
            Escolha um método para registrar esta conta.
          </p>
        </div>
        
        <div className="p-4 bg-[var(--muted)] space-y-3">
             <button
                onClick={onSelectQuick}
                className="w-full text-left p-4 rounded-lg hover:bg-[var(--accent)] transition-colors flex items-center"
            >
                <i className="fas fa-bolt text-xl text-[var(--success)] mr-4"></i>
                <div>
                    <p className="font-semibold text-[var(--color-text)]">Lançamento Rápido (IA)</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Descreva o pagamento e deixe a IA preencher os detalhes.</p>
                </div>
            </button>
             <button
                onClick={onSelectManual}
                className="w-full text-left p-4 rounded-lg hover:bg-[var(--accent)] transition-colors flex items-center"
            >
                <i className="fas fa-keyboard text-xl text-[var(--primary)] mr-4"></i>
                <div>
                    <p className="font-semibold text-[var(--color-text)]">Lançamento Manual</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Preencha os campos do formulário diretamente.</p>
                </div>
            </button>
        </div>

        <div className="p-4 bg-[var(--muted)] border-t border-[var(--border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--secondary-foreground)] bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] border border-[var(--border)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayBillChoiceModal;
