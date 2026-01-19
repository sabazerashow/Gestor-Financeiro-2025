
import React, { useState } from 'react';
import db, { purgeAccountData } from '@/lib/db';
import { seedMockData } from '@/lib/seed';
import { Transaction } from '@/types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountId: string | null;
    onDataChanged?: () => void;
}

const SettingsOption: React.FC<{
    title: string;
    description: string;
    icon: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
    loading?: boolean;
}> = ({ title, description, icon, onClick, variant = 'default', loading = false }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group flex items-start gap-4 mb-3 ${variant === 'danger'
            ? 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20'
            : 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--surface)] hover:border-[var(--primary)]/30'
            }`}
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${variant === 'danger'
            ? 'bg-red-500 text-white'
            : 'bg-[var(--surface)] text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white'
            }`}>
            {loading ? (
                <i className="fas fa-spinner fa-spin text-lg"></i>
            ) : (
                <i className={`fas ${icon} text-lg`}></i>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <h3 className={`font-black text-sm uppercase tracking-wider mb-1 ${variant === 'danger' ? 'text-red-500' : 'text-[var(--color-text)]'}`}>
                {title}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">
                {description}
            </p>
        </div>
    </button>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, accountId, onDataChanged }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showConfirmSeed, setShowConfirmSeed] = useState(false);
    const [showConfirmImport, setShowConfirmImport] = useState(false);
    const [pendingImportData, setPendingImportData] = useState<any>(null);
    const [showConfirmResetTransactions, setShowConfirmResetTransactions] = useState(false);

    const handleSeed = async () => {
        console.log('[Settings] handleSeed called. accountId:', accountId);
        if (!accountId) {
            setMessage({ type: 'error', text: "A conta ainda não está pronta. Tente fazer login novamente." });
            return;
        }
        setShowConfirmSeed(true);
    };

    const confirmSeed = async () => {
        setShowConfirmSeed(false);
        setLoading(true);
        setMessage(null);
        try {
            console.log('[Settings] Starting seedMockData for:', accountId);
            await seedMockData(accountId!);
            setMessage({ type: 'success', text: "Sucesso! Dados populados. Recarregando..." });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (e: any) {
            console.error('[Settings] Seed error:', e);
            setMessage({ type: 'error', text: "Erro: " + e.message });
            setLoading(false);
        }
    };


    const handleExport = async () => {
        if (!accountId) return;
        setLoading(true);
        try {
            const [transactions, recurring, bills, payslips, budgets, goals] = await Promise.all([
                db.fetchTransactions(accountId),
                db.fetchRecurring(accountId),
                db.fetchBills(accountId),
                db.fetchPayslips(accountId),
                db.fetchBudgets(accountId),
                db.fetchGoals(accountId),
            ]);

            const backupData = {
                version: '1.2.0',
                timestamp: new Date().toISOString(),
                transactions,
                recurring_transactions: recurring,
                bills,
                payslips,
                budgets,
                financial_goals: goals
            };

            const dataStr = JSON.stringify(backupData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_financeiro_completo_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e: any) {
            setMessage({ type: 'error', text: "Erro ao exportar: " + e.message });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!accountId || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        const reader = new FileReader();
        setLoading(true);
        reader.onload = async (event) => {
            try {
                const content = event.target?.result as string;
                const data = JSON.parse(content);
                if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
                    throw new Error("Formato de arquivo de backup inválido.");
                }

                setPendingImportData(data);
                setShowConfirmImport(true);
            } catch (err: any) {
                setMessage({ type: 'error', text: "Erro ao importar: " + err.message });
            } finally {
                setLoading(false);
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const runImport = async (mode: 'append' | 'replace') => {
        if (!accountId || !pendingImportData) return;
        setShowConfirmImport(false);
        setLoading(true);
        setMessage(null);
        try {
            if (mode === 'replace') {
                if (Array.isArray(pendingImportData)) {
                    await db.deleteAllTransactions(accountId);
                } else {
                    await purgeAccountData(accountId);
                }
            }

            if (Array.isArray(pendingImportData)) {
                await db.upsertTransactions(pendingImportData as any, accountId);
            } else if (pendingImportData && typeof pendingImportData === 'object') {
                const tasks = [];
                if (pendingImportData.transactions) tasks.push(db.upsertTransactions(pendingImportData.transactions, accountId));
                if (pendingImportData.recurring_transactions) tasks.push(db.upsertRecurring(pendingImportData.recurring_transactions, accountId));
                if (pendingImportData.bills) tasks.push(db.upsertBills(pendingImportData.bills, accountId));
                if (pendingImportData.payslips) tasks.push(db.upsertPayslips(pendingImportData.payslips, accountId));
                if (pendingImportData.budgets) tasks.push(db.upsertBudgets(pendingImportData.budgets, accountId));
                if (pendingImportData.financial_goals) tasks.push(db.upsertGoals(pendingImportData.financial_goals, accountId));
                await Promise.all(tasks);
            } else {
                throw new Error("Formato de arquivo de backup inválido.");
            }

            onDataChanged?.();
            setMessage({ type: 'success', text: "Backup importado com sucesso! Recarregando..." });
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err: any) {
            setMessage({ type: 'error', text: "Erro ao importar: " + err.message });
        } finally {
            setLoading(false);
            setPendingImportData(null);
        }
    };

    const confirmResetTransactions = async () => {
        if (!accountId) return;
        setShowConfirmResetTransactions(false);
        setLoading(true);
        setMessage(null);
        try {
            await db.deleteAllTransactions(accountId);
            onDataChanged?.();
            setMessage({ type: 'success', text: "Lançamentos zerados com sucesso! Recarregando..." });
            setTimeout(() => window.location.reload(), 1200);
        } catch (err: any) {
            setMessage({ type: 'error', text: "Erro ao zerar lançamentos: " + err.message });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-[var(--background)] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 animate-in fade-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-[var(--color-text)] uppercase tracking-widest flex items-center gap-3">
                                <i className="fas fa-cog text-[var(--primary)]"></i>
                                Configurações
                            </h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Gestão de Dados e App</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"
                        >
                            <i className="fas fa-times text-lg"></i>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {message && (
                            <div className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {showConfirmSeed && (
                            <div className="p-6 rounded-3xl mb-6 bg-[var(--primary)]/5 border border-[var(--primary)]/20 animate-in zoom-in-95 duration-200">
                                <p className="text-sm font-bold text-[var(--color-text)] mb-4">
                                    Deseja popular a conta com dados fictícios para teste?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowConfirmSeed(false)}
                                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmSeed}
                                        className="flex-[2] py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold transition-all hover:brightness-110"
                                    >
                                        Confirmar Popular
                                    </button>
                                </div>
                            </div>
                        )}

                        {showConfirmImport && (
                            <div className="p-6 rounded-3xl mb-6 bg-[var(--primary)]/5 border border-[var(--primary)]/20 animate-in zoom-in-95 duration-200">
                                <p className="text-sm font-bold text-[var(--color-text)] mb-4">
                                    Deseja adicionar estes dados aos atuais ou substituir tudo?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setShowConfirmImport(false); setPendingImportData(null); }}
                                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => runImport('append')}
                                        className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bold transition-all"
                                    >
                                        Adicionar
                                    </button>
                                    <button
                                        onClick={() => runImport('replace')}
                                        className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold transition-all hover:brightness-110"
                                    >
                                        Substituir
                                    </button>
                                </div>
                            </div>
                        )}

                        {showConfirmResetTransactions && (
                            <div className="p-6 rounded-3xl mb-6 bg-red-500/5 border border-red-500/20 animate-in zoom-in-95 duration-200">
                                <p className="text-sm font-bold text-[var(--color-text)] mb-4">
                                    Deseja zerar todos os lançamentos desta conta?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowConfirmResetTransactions(false)}
                                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmResetTransactions}
                                        className="flex-[2] py-2 rounded-xl bg-red-500 text-white text-xs font-bold transition-all hover:brightness-110"
                                    >
                                        Confirmar Zerar
                                    </button>
                                </div>
                            </div>
                        )}

                        <section>
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-1">Ferramentas</h4>
                            <SettingsOption
                                title="Popular Dados Fake"
                                description="Gera lançamentos e contas fictícias para você testar as funcionalidades do app."
                                icon="fa-database"
                                onClick={handleSeed}
                                loading={loading}
                            />
                            <SettingsOption
                                title="Exportar Backup (JSON)"
                                description="Faça o download de todos os seus dados em formato JSON para backup externo."
                                icon="fa-file-export"
                                onClick={handleExport}
                                loading={loading}
                            />
                            <div className="relative">
                                <input
                                    type="file"
                                    id="import-backup"
                                    className="hidden"
                                    accept=".json"
                                    onChange={handleImport}
                                />
                                <SettingsOption
                                    title="Importar Backup (JSON)"
                                    description="Selecione um arquivo de backup JSON para restaurar seus dados."
                                    icon="fa-file-import"
                                    onClick={() => document.getElementById('import-backup')?.click()}
                                    loading={loading}
                                />
                            </div>
                            <SettingsOption
                                title="Zerar Lançamentos"
                                description="Remove todos os lançamentos desta conta (ações irreversíveis)."
                                icon="fa-trash"
                                variant="danger"
                                onClick={() => setShowConfirmResetTransactions(true)}
                                loading={loading}
                            />
                        </section>

                    </div>
                </div>

                <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                        Finance Pilot <span className="text-[var(--primary)]">•</span> v1.2.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
