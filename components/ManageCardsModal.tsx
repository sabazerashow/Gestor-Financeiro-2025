

import React, { useState } from 'react';
import { DashboardCardConfig } from '../App';

interface ManageCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: DashboardCardConfig[];
  visibility: Record<string, boolean>;
  onToggle: (cardId: string) => void;
  onOrderChange: (newOrder: string[]) => void;
}

const ManageCardsModal: React.FC<ManageCardsModalProps> = ({ isOpen, onClose, allCards, visibility, onToggle, onOrderChange }) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, cardId: string) => {
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { // Use timeout to allow the browser to render the drag image before state changes
        setDraggedItemId(cardId);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetCardId: string) => {
    e.preventDefault();
    const sourceCardId = e.dataTransfer.getData('cardId');
    if (sourceCardId === targetCardId) return;

    const currentOrder = allCards.map(c => c.id);
    const sourceIndex = currentOrder.indexOf(sourceCardId);
    const targetIndex = currentOrder.indexOf(targetCardId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newOrder = [...currentOrder];
    const [removed] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, removed);
    
    onOrderChange(newOrder);
  };
  
  const handleDragEnd = () => {
    setDraggedItemId(null);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col transition-all duration-300">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Gerenciar e Ordenar Cartões</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <ul className="space-y-3">
            {allCards.map(card => {
              const isVisible = visibility[card.id];
              const isDragging = draggedItemId === card.id;
              return (
                <li 
                    key={card.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, card.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all ${isDragging ? 'opacity-40 border-2 border-dashed border-indigo-400' : 'border-2 border-transparent'}`}
                >
                  <div className="flex items-center space-x-4">
                     <span className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" title="Arraste para reordenar">
                        <i className="fas fa-grip-vertical"></i>
                    </span>
                    <div className="text-xl text-indigo-500 w-6 text-center">
                        <i className={`fas ${card.icon}`}></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{card.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggle(card.id)}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors w-32 ${
                      isVisible
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isVisible ? (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        Adicionado
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus mr-2"></i>
                        Adicionar
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageCardsModal;