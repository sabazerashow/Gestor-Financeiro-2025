
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
        if (!accountId) return;
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

    const handleReset = async () => {
        if (!accountId) return;
        if (!window.confirm("CUIDADO: Isso apagará TODOS os seus lançamentos e contas. Esta ação não tem volta. Tem certeza?")) return;

        setLoading(true);
        try {
            const { purgeAccountData } = await import('@/lib/db');
            await purgeAccountData(accountId);
            alert("Sucesso! Sua conta foi limpa. O app será reiniciado.");
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
            const transactions = await db.fetchTransactions(accountId);
            const dataStr = JSON.stringify(transactions, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_financeiro_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e: any) {
            alert("Erro ao exportar: " + e.message);
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
                            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
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
                        </section>

                        <section className="pt-4 border-t border-white/5">
                            <h4 className="text-[10px] font-black text-red-500/50 uppercase tracking-[0.2em] mb-4 ml-1">Zona de Perigo</h4>
                            <SettingsOption
                                title="Apagar todos os dados"
                                description="Remove permanentemente todos os lançamentos, contas e configurações desta conta."
                                icon="fa-trash-alt"
                                onClick={handleReset}
                                variant="danger"
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
