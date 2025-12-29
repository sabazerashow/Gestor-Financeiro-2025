
import React, { useState } from 'react';
import db from '@/lib/db';
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

    const handleSeed = async () => {
        if (!accountId) {
            alert("A conta ainda não está pronta. Tente fazer login ou aguarde um momento.");
            return;
        }
        if (!window.confirm("Deseja popular a conta com dados fictícios para teste?")) return;

        setLoading(true);
        try {
            await seedMockData(accountId);
            alert("Sucesso! Dados populados. O app será reiniciado.");
            window.location.reload();
        } catch (e: any) {
            alert("Erro: " + e.message);
        } finally {
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
            alert("Erro ao exportar: " + e.message);
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

                // Suporte para o formato antigo (apenas array de transações)
                if (Array.isArray(data)) {
                    await db.upsertTransactions(data as any, accountId);
                } else if (data && typeof data === 'object') {
                    // Novo formato: objeto com múltiplas coleções
                    const tasks = [];
                    if (data.transactions) tasks.push(db.upsertTransactions(data.transactions, accountId));
                    if (data.recurring_transactions) tasks.push(db.upsertRecurring(data.recurring_transactions, accountId));
                    if (data.bills) tasks.push(db.upsertBills(data.bills, accountId));
                    if (data.payslips) tasks.push(db.upsertPayslips(data.payslips, accountId));
                    if (data.budgets) tasks.push(db.upsertBudgets(data.budgets, accountId));
                    if (data.financial_goals) tasks.push(db.upsertGoals(data.financial_goals, accountId));

                    await Promise.all(tasks);
                } else {
                    throw new Error("Formato de arquivo de backup inválido.");
                }

                alert("Backup importado com sucesso! O aplicativo será recarregado.");
                window.location.reload();
            } catch (err: any) {
                alert("Erro ao importar: " + err.message);
            } finally {
                setLoading(false);
                e.target.value = '';
            }
        };
        reader.readAsText(file);
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
