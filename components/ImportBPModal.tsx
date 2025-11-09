import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Payslip, PayslipLineItem } from '../types';

interface ImportBPModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: { content: string; mimeType: string } | null;
  onConfirm: (payslipData: Omit<Payslip, 'id'>, shouldLaunchTransaction: boolean) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const cleanJsonString = (str: string) => str.replace(/```json/g, '').replace(/```/g, '').trim();

const ImportBPModal: React.FC<ImportBPModalProps> = ({ isOpen, onClose, file, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Omit<Payslip, 'id'> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen && file) {
      processFile(file);
    } else {
        setExtractedData(null);
        setError(null);
        setIsLoading(false);
        setIsEditing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, file]);

  // Recalculate totals when in edit mode and payments/deductions change
  useEffect(() => {
    if (isEditing && extractedData) {
        const grossTotal = extractedData.payments.reduce((acc, p) => acc + Number(p.value), 0);
        const deductionsTotal = extractedData.deductions.reduce((acc, d) => acc + Number(d.value), 0);
        const netTotal = grossTotal - deductionsTotal;

        if (grossTotal !== extractedData.grossTotal || deductionsTotal !== extractedData.deductionsTotal || netTotal !== extractedData.netTotal) {
            setExtractedData(prev => prev ? { ...prev, grossTotal, deductionsTotal, netTotal } : null);
        }
    }
  }, [isEditing, extractedData]);

  const processFile = async (fileData: { content: string; mimeType: string }) => {
    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    setIsEditing(false);

    try {
        if (!fileData.mimeType.startsWith('image/')) {
            throw new Error('Formato de arquivo inválido. Por favor, envie apenas uma imagem (PNG, JPG, etc).');
        }
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                month: { type: Type.NUMBER, description: "O número do mês (1 para Janeiro, 12 para Dezembro)" },
                year: { type: Type.NUMBER, description: "O ano com 4 dígitos" },
                payments: { 
                    type: Type.ARRAY,
                    description: "Lista de todos os rendimentos.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING },
                            value: { type: Type.NUMBER }
                        },
                        required: ["description", "value"]
                    }
                },
                deductions: {
                    type: Type.ARRAY,
                    description: "Lista de todos os descontos.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING },
                            value: { type: Type.NUMBER }
                        },
                        required: ["description", "value"]
                    }
                },
                grossTotal: { type: Type.NUMBER, description: "O valor total na coluna 'Pagamentos'."},
                deductionsTotal: { type: Type.NUMBER, description: "O valor total na coluna 'Descontos'."},
                netTotal: { type: Type.NUMBER, description: "O valor do 'Total líquido'."},
            },
            required: ['month', 'year', 'payments', 'deductions', 'grossTotal', 'deductionsTotal', 'netTotal'],
        };
        
        const prompt = `Você é um especialista em OCR e análise de contracheques (Bilhetes de Pagamento) da Marinha do Brasil. Analise a imagem a seguir com extrema precisão e extraia as informações financeiras.

**Instruções de Extração:**
1.  **Data de Referência**: Localize o "Mês de Pagamento" e o ano. Converta o nome do mês para seu número (ex: Setembro = 9).
2.  **Itens de Pagamento**: Identifique a tabela de verbas. Para cada linha que tiver um valor na coluna "Pagamentos", extraia a "Descrição" exata daquela linha e o valor numérico correspondente.
3.  **Itens de Desconto**: Faça o mesmo para a coluna "Descontos". Para cada linha com um valor em "Descontos", extraia a "Descrição" e o valor.
4.  **Valores Totais**: Encontre a linha "Totais em R$" na parte inferior. Extraia os três valores nesta ordem: Total de Pagamentos, Total de Descontos e Total Líquido.

**Regras Importantes:**
- NÃO invente valores ou descrições. Se uma informação não estiver clara, não a inclua.
- Associe corretamente a descrição da linha com os valores de pagamento ou desconto na MESMA linha.
- Converta todos os valores monetários para números (ex: 1.234,56 se torna 1234.56).

Responda APENAS com um objeto JSON válido, seguindo o schema fornecido.`;
        
        const imagePart = {
            inlineData: {
                mimeType: fileData.mimeType,
                data: fileData.content.split(',')[1], // Remove "data:image/png;base64," part
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, imagePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema
            }
        });
      
      const parsedData = JSON.parse(cleanJsonString(response.text)) as Omit<Payslip, 'id'>;
      setExtractedData(parsedData);

    } catch (e: any) {
      setError('Não foi possível analisar o arquivo. Verifique se a imagem está nítida e tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = (shouldLaunchTransaction: boolean) => {
    if (!extractedData) return;
    onConfirm(extractedData, shouldLaunchTransaction);
    onClose();
  };

  const handleItemChange = (type: 'payments' | 'deductions', index: number, field: 'description' | 'value', value: string) => {
    if (!extractedData) return;
    
    const updatedItems = [...extractedData[type]];
    const itemToUpdate = { ...updatedItems[index] };

    if (field === 'value') {
        itemToUpdate.value = parseFloat(value) || 0;
    } else {
        itemToUpdate.description = value;
    }
    
    updatedItems[index] = itemToUpdate;

    setExtractedData({
        ...extractedData,
        [type]: updatedItems,
    });
  };

  if (!isOpen) return null;
  
  const renderItemRows = (items: PayslipLineItem[], type: 'payments' | 'deductions') => (
    <ul className="space-y-1">
        {items.map((p, i) => (
            <li key={i} className="flex justify-between items-center gap-2">
                {isEditing ? (
                    <input type="text" value={p.description} onChange={(e) => handleItemChange(type, i, 'description', e.target.value)} className="w-full bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 text-sm"/>
                ) : (
                    <span>{p.description}</span>
                )}
                {isEditing ? (
                    <input type="number" value={p.value} onChange={(e) => handleItemChange(type, i, 'value', e.target.value)} className="w-32 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 text-sm text-right"/>
                ) : (
                    <span>{p.value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                )}
            </li>
        ))}
    </ul>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Importar Contracheque (BP)</h2>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center h-full">
              <i className="fas fa-spinner fa-spin text-4xl text-indigo-500"></i>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Analisando contracheque...</p>
            </div>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {extractedData && (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-white">
                    Resumo para {new Date(extractedData.year, extractedData.month - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">Pagamentos</h4>
                        {renderItemRows(extractedData.payments, 'payments')}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Descontos</h4>
                        {renderItemRows(extractedData.deductions, 'deductions')}
                    </div>
                </div>
                <div className="flex justify-around bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-center font-bold">
                    <div><span className="block text-xs text-gray-500">Total Bruto</span> <span className="text-green-600">{extractedData.grossTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                    <div><span className="block text-xs text-gray-500">Total Descontos</span> <span className="text-red-600">{extractedData.deductionsTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                    <div><span className="block text-xs text-gray-500">Total Líquido</span> <span className="text-indigo-600 text-lg">{extractedData.netTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                </div>
                {!isEditing && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                        Revise os dados extraídos. Você pode <button onClick={() => setIsEditing(true)} className="text-indigo-500 hover:underline font-semibold">Editar</button> se algo estiver incorreto.
                    </p>
                )}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
           {isEditing ? (
             <div className="flex justify-end">
                <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    Concluir Edição
                </button>
             </div>
           ) : (
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => setIsEditing(true)}
                        disabled={isLoading || error !== null || !extractedData}
                        className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Editar
                    </button>
                </div>
                <div className="flex items-center gap-3">
                     <button
                        onClick={() => handleConfirm(false)}
                        disabled={isLoading || error !== null || !extractedData}
                        className="px-4 py-2 text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Confirmar e não lançar
                    </button>
                    <button
                        onClick={() => handleConfirm(true)}
                        disabled={isLoading || error !== null || !extractedData}
                        className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Confirmar e Lançar Transação
                    </button>
                </div>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ImportBPModal;