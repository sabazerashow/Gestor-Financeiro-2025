import React, { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (start: string, end: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const handleExportClick = () => {
    if (startDate && endDate && startDate <= endDate) {
      onExport(startDate, endDate);
    } else {
      alert('Por favor, selecione um período de datas válido.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-[var(--card)] rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold text-[var(--color-text)]">Exportar Lançamentos</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Selecione o período que deseja exportar para um arquivo CSV.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
             <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-[var(--color-text-muted)]">Data de Início</label>
                <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] sm:text-sm"
                />
             </div>
             <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-[var(--color-text-muted)]">Data Final</label>
                <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--primary)] sm:text-sm"
                />
             </div>
          </div>
        </div>
        
        <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--color-text)] bg-[var(--card)] hover:bg-[var(--color-surface-hover)] border border-[var(--border)] transition-colors"
          >
            Cancelar
          </button>
           <button
            onClick={handleExportClick}
            className="px-4 py-2 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors"
          >
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
