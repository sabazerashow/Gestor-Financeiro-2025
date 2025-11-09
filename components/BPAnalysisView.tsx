import React, { useState, useMemo, useRef } from 'react';
import ErrorBanner from './ui/error-banner';
import { Payslip, Transaction } from '../types';
import UnderstandBPModal from './UnderstandBPModal';
import { DashboardCardConfig } from '../App';
import ManageCardsModal from './ManageCardsModal';
import MonthlyAnalysisCard from './bp-analysis-cards/MonthlyAnalysisCard';
import AnnualAnalysisCard from './bp-analysis-cards/AnnualAnalysisCard';
import PurchasingPowerCard from './bp-analysis-cards/PurchasingPowerCard';

interface BPAnalysisViewProps {
  payslips: Payslip[];
  transactions: Transaction[];
  onFileSelectedBP: (file: { content: string; mimeType: string }, mode: 'ocr' | 'ai') => void;
  onManualAdd: () => void;
}

const BPAnalysisView: React.FC<BPAnalysisViewProps> = ({ payslips, transactions, onFileSelectedBP, onManualAdd }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB para imagens do BP
  const [isUnderstandModalOpen, setIsUnderstandModalOpen] = useState(false);
  const [isManageCardsModalOpen, setIsManageCardsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const importModeRef = useRef<'ocr' | 'ai'>('ocr');

  const allBPCards: DashboardCardConfig[] = useMemo(() => [
    {
      id: 'monthlyAnalysis',
      title: 'Análise Mensal Detalhada',
      description: 'Veja a composição do seu salário, descontos e margem para um mês específico.',
      icon: 'fa-calendar-day',
      component: MonthlyAnalysisCard,
    },
    {
      id: 'annualAnalysis',
      title: 'Análise Anual',
      description: 'Acompanhe a evolução do seu salário e gastos comprometidos ao longo do ano.',
      icon: 'fa-calendar-alt',
      component: AnnualAnalysisCard,
    },
    {
      id: 'purchasingPower',
      title: 'Análise do Poder de Compra',
      description: 'Compare seu salário nominal com o salário real, ajustado pela inflação (IPCA).',
      icon: 'fa-chart-line',
      component: PurchasingPowerCard,
    },
  ], []);

  const [cardVisibility, setCardVisibility] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('bpCardVisibility');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { /* fall through */ }
    }
    return { monthlyAnalysis: true, annualAnalysis: true, purchasingPower: true };
  });

  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    const savedOrder = localStorage.getItem('bpCardOrder');
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder) as string[];
        const allCardIds = new Set(allBPCards.map(c => c.id));
        const savedCardIds = new Set(parsed);
        if (allCardIds.size === savedCardIds.size && [...allCardIds].every(id => savedCardIds.has(id))) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse BP card order from localStorage", e);
      }
    }
    return allBPCards.map(card => card.id);
  });

  React.useEffect(() => {
    localStorage.setItem('bpCardVisibility', JSON.stringify(cardVisibility));
  }, [cardVisibility]);

  React.useEffect(() => {
    localStorage.setItem('bpCardOrder', JSON.stringify(cardOrder));
  }, [cardOrder]);

  const sortedCards = useMemo(() => {
    return [...allBPCards].sort((a, b) => cardOrder.indexOf(a.id) - cardOrder.indexOf(b.id));
  }, [allBPCards, cardOrder]);

  const visibleCards = sortedCards.filter(card => cardVisibility[card.id]);

  const handleImportOCRClick = () => {
    importModeRef.current = 'ocr';
    fileInputRef.current?.click();
  };

  const handleImportAIClick = () => {
    importModeRef.current = 'ai';
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const lowerName = file.name.toLowerCase();
      const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp'];
      const isValidType = allowedImageTypes.includes(file.type) || lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.webp');
      if (!isValidType) {
        setError('Formato de imagem não suportado. Permitidos: PNG, JPEG, WEBP.');
        if (event.target) event.target.value = '';
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setError('A imagem excede o limite de 5 MB.');
        if (event.target) event.target.value = '';
        return;
      }
      const reader = new FileReader();
      const mimeType = file.type;
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          onFileSelectedBP({ content, mimeType }, importModeRef.current);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const componentProps = {
    monthlyAnalysis: { payslips, transactions },
    annualAnalysis: { payslips, transactions },
    purchasingPower: { payslips, transactions },
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Análise de Contracheques</h2>
          {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center rounded-md shadow-sm">
                 <button
                    onClick={onManualAdd}
                    className="relative inline-flex items-center px-3 py-1 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <i className="fas fa-keyboard mr-2"></i>
                    Lançar Manual
                </button>
                <button
                    onClick={handleImportOCRClick}
                    className="-ml-px relative inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300"
                >
                    <i className="fas fa-upload mr-2"></i>
                    Importar OCR
                </button>
                <button
                    onClick={handleImportAIClick}
                    className="-ml-px relative inline-flex items-center px-3 py-1 rounded-r-md border border-gray-300 dark:border-gray-600 bg-purple-600 text-sm font-medium text-white hover:bg-purple-700 focus:z-10 focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300"
                >
                    <i className="fas fa-robot mr-2"></i>
                    Importar com IA
                </button>
            </div>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png,image/jpeg,image/webp"
            />
            <button
              onClick={() => setIsUnderstandModalOpen(true)}
              className="px-3 py-1 text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-question-circle"></i>
              <span>Entenda seu BP</span>
            </button>
             <button
                onClick={() => setIsManageCardsModalOpen(true)}
                className="px-3 py-1 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-cogs"></i>
              <span>Gerenciar cartões</span>
            </button>
          </div>
        </div>
      </div>

      {payslips.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <i className="fas fa-file-pdf text-5xl text-gray-300 dark:text-gray-600"></i>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Nenhum contracheque importado ainda.</p>
          <p className="text-sm text-gray-400">Use um dos botões acima para adicionar um.</p>
        </div>
      ) : visibleCards.length === 0 ? (
         <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <i className="fas fa-grip-horizontal text-5xl text-gray-300 dark:text-gray-600"></i>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Nenhum cartão visível.</p>
          <p className="text-sm text-gray-400">Use o botão "Gerenciar cartões" para adicionar alguns ao seu painel.</p>
        </div>
      ) : (
        <div className="space-y-8">
            {visibleCards.map(card => {
                const CardComponent = card.component;
                const props = componentProps[card.id as keyof typeof componentProps] || {};
                return (
                    <div key={card.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <CardComponent {...props} />
                    </div>
                );
            })}
        </div>
      )}
      
      <UnderstandBPModal
        isOpen={isUnderstandModalOpen}
        onClose={() => setIsUnderstandModalOpen(false)}
      />

      <ManageCardsModal
        isOpen={isManageCardsModalOpen}
        onClose={() => setIsManageCardsModalOpen(false)}
        allCards={allBPCards}
        visibility={cardVisibility}
        onToggle={(cardId: string) => setCardVisibility(prev => ({ ...prev, [cardId]: !prev[cardId] }))}
        onOrderChange={setCardOrder}
      />
    </div>
  );
};

export default BPAnalysisView;
