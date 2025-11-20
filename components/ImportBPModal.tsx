import React, { useState, useEffect } from 'react';
import { recognizeTextFromDataUrl, recognizePayslip, parsePayslipFromText, parsePayslipFromStructured } from '@/lib/ocr';
import { generateContent } from '@/lib/aiClient';
import { Payslip, PayslipLineItem } from '../types';

interface ImportBPModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: { content: string; mimeType: string } | null;
  mode?: 'ocr' | 'ai';
  onConfirm: (payslipData: Omit<Payslip, 'id'>, shouldLaunchTransaction: boolean) => void;
}

const cleanJsonString = (str: string) => str.replace(/```json/g, '').replace(/```/g, '').trim();

const ImportBPModal: React.FC<ImportBPModalProps> = ({ isOpen, onClose, file, mode = 'ocr', onConfirm }) => {
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

        let parsed: Omit<Payslip, 'id'> | null = null;

        if (mode === 'ai') {
            const ocrText = await recognizeTextFromDataUrl(fileData.content, 'por');

            const prompt = `Você receberá o texto extraído (OCR) de um contracheque brasileiro.
Extraia um JSON com:
{
  "month": número de 1 a 12,
  "year": número com 4 dígitos,
  "payments": [{"description": string, "value": number}],
  "deductions": [{"description": string, "value": number}]
}
Regras:
- Use os blocos "Pagamentos" e "Descontos"; se não houver indicação clara, deduza pela linha de totais.
- Valores devem ser números (ponto ou vírgula como decimal serão normalizados).
- Ignore colunas de parâmetros.
Texto OCR:\n\n${ocrText}`;

            try {
                const response = await generateContent({ model: 'gemini-2.5-flash', contents: prompt, expectJson: true });
                const ai = JSON.parse(cleanJsonString(response.text));
                const payments: PayslipLineItem[] = Array.isArray(ai.payments) ? ai.payments.map((p: any) => ({ description: String(p.description || '').trim(), value: Number(String(p.value).replace(',', '.')) || 0 })) : [];
                const deductions: PayslipLineItem[] = Array.isArray(ai.deductions) ? ai.deductions.map((d: any) => ({ description: String(d.description || '').trim(), value: Number(String(d.value).replace(',', '.')) || 0 })) : [];
                const grossTotal = payments.reduce((acc, p) => acc + Number(p.value), 0);
                const deductionsTotal = deductions.reduce((acc, d) => acc + Number(d.value), 0);
                const netTotal = grossTotal - deductionsTotal;
                parsed = {
                    month: Number(ai.month) || new Date().getMonth() + 1,
                    year: Number(ai.year) || new Date().getFullYear(),
                    payments,
                    deductions,
                    grossTotal,
                    deductionsTotal,
                    netTotal,
                };
            } catch (err) {
                console.warn('Falha IA, tentando OCR estruturado como fallback.', err);
            }
        }

        if (!parsed) {
            // OCR estruturado primeiro (sem IA)
            const ocr = await recognizePayslip(fileData.content, 'por');
            parsed = parsePayslipFromStructured(ocr.lines, ocr.text);
            // Fallback para parser textual simples se não houver itens/totais
            if (!parsed || (!parsed.payments.length && !parsed.deductions.length)) {
                const ocrText = ocr.text || await recognizeTextFromDataUrl(fileData.content, 'por');
                parsed = parsePayslipFromText(ocrText);
            }
        }

        if (!parsed || (!parsed.payments.length && !parsed.deductions.length && !parsed.netTotal)) {
            throw new Error('Não foi possível identificar os campos do contracheque.');
        }
        setExtractedData(parsed);
        setError(null);
    } catch (e: any) {
        console.error(e);
        setError('Não foi possível analisar o arquivo. Verifique se a imagem está nítida e tente novamente.');
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

  const moveItem = (from: 'payments' | 'deductions', index: number) => {
    if (!extractedData) return;
    const source = [...extractedData[from]];
    const [item] = source.splice(index, 1);
    const to: 'payments' | 'deductions' = from === 'payments' ? 'deductions' : 'payments';
    const target = [...extractedData[to], item];
    setExtractedData({
      ...extractedData,
      [from]: source,
      [to]: target,
    });
  };

  const reorderItem = (type: 'payments' | 'deductions', index: number, direction: 'up' | 'down') => {
    if (!extractedData) return;
    const list = [...extractedData[type]];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(newIndex, 0, item);
    setExtractedData({ ...extractedData, [type]: list });
  };

  const removeItem = (type: 'payments' | 'deductions', index: number) => {
    if (!extractedData) return;
    const list = [...extractedData[type]];
    list.splice(index, 1);
    setExtractedData({ ...extractedData, [type]: list });
  };

  const addItem = (type: 'payments' | 'deductions') => {
    if (!extractedData) return;
    const list = [...extractedData[type]];
    list.push({ description: '', value: 0 });
    setExtractedData({ ...extractedData, [type]: list });
    setIsEditing(true);
  };

  const handlePeriodChange = (field: 'month' | 'year', value: number) => {
    if (!extractedData) return;
    setExtractedData({ ...extractedData, [field]: value });
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
                {isEditing && (
                    <div className="flex items-center gap-1">
                        <button title="Subir" onClick={() => reorderItem(type, i, 'up')} className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                          ↑
                        </button>
                        <button title="Descer" onClick={() => reorderItem(type, i, 'down')} className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                          ↓
                        </button>
                        <button title="Mover para outra lista" onClick={() => moveItem(type, i)} className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
                          ↔
                        </button>
                        <button title="Remover" onClick={() => removeItem(type, i)} className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800">
                          Remover
                        </button>
                    </div>
                )}
            </li>
        ))}
        {isEditing && (
          <li className="flex justify-end">
            <button onClick={() => addItem(type)} className="mt-1 px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800">
              Adicionar {type === 'payments' ? 'Pagamento' : 'Desconto'}
            </button>
          </li>
        )}
    </ul>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Importar Contracheque (BP)</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Modo: {mode === 'ai' ? 'Importar com IA' : 'Importar OCR'}</p>
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
                {isEditing && (
                  <div className="flex justify-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <label className="text-gray-600 dark:text-gray-300">Mês</label>
                      <select value={extractedData.month} onChange={(e) => handlePeriodChange('month', Number(e.target.value))} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
                        {Array.from({ length: 12 }).map((_, idx) => (
                          <option key={idx+1} value={idx+1}>{new Date(2000, idx, 1).toLocaleString('pt-BR', { month: 'long' })}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-gray-600 dark:text-gray-300">Ano</label>
                      <input type="number" value={extractedData.year} onChange={(e) => handlePeriodChange('year', Number(e.target.value))} className="w-24 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <h4 className="font-bold text-income mb-2">Pagamentos</h4>
                        {renderItemRows(extractedData.payments, 'payments')}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <h4 className="font-bold text-expense mb-2">Descontos</h4>
                        {renderItemRows(extractedData.deductions, 'deductions')}
                    </div>
                </div>
                <div className="flex justify-around bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-center font-bold">
                    <div><span className="block text-xs text-gray-500">Total Bruto</span> <span className="text-income">{extractedData.grossTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                    <div><span className="block text-xs text-gray-500">Total Descontos</span> <span className="text-expense">{extractedData.deductionsTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                    <div><span className="block text-xs text-gray-500">Total Líquido</span> <span className="text-primary text-lg">{extractedData.netTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
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
                    className="px-4 py-2 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors"
                >
                    Concluir Edição
                </button>
             </div>
           ) : (
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium rounded-md text-[var(--secondary-foreground)] bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] border border-[var(--border)] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => setIsEditing(true)}
                        disabled={isLoading || error !== null || !extractedData}
                        className="px-4 py-2 text-sm font-medium rounded-md text-[var(--secondary-foreground)] bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] border border-[var(--border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Editar
                    </button>
                </div>
                <div className="flex items-center gap-3">
                     <button
                        onClick={() => handleConfirm(false)}
                        disabled={isLoading || error !== null || !extractedData}
                        className="px-4 py-2 text-sm font-medium rounded-md text-[var(--secondary-foreground)] bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] disabled:bg-[var(--muted)] disabled:cursor-not-allowed transition-colors"
                    >
                        Confirmar e não lançar
                    </button>
                    <button
                        onClick={() => handleConfirm(true)}
                        disabled={isLoading || error !== null || !extractedData}
                        className="px-4 py-2 text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--muted)] disabled:cursor-not-allowed transition-colors"
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
