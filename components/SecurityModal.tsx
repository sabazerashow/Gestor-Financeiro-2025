
import React, { useState } from 'react';
import supabase from '@/lib/supabase';

interface SecurityModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail?: string;
    lastSignIn?: string;
    onPurgeData?: () => Promise<void>;
}

const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose, userEmail, lastSignIn, onPurgeData }) => {
    const [loading, setLoading] = useState(false);
    const [purgeLoading, setPurgeLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showDirectChange, setShowDirectChange] = useState(false);
    const [showConfirmPurge, setShowConfirmPurge] = useState(false);

    const handleResetPassword = async () => {
        if (!userEmail) return;
        setLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setMessage({ type: 'success', text: 'E-mail de redefinição enviado com sucesso!' });
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setNewPassword('');
            setConfirmPassword('');
            setShowDirectChange(false);
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    const handlePurgeClick = () => {
        console.log('[Security] handlePurgeClick');
        setShowConfirmPurge(true);
        setMessage(null);
    };

    const confirmPurge = async () => {
        if (!onPurgeData) return;
        setShowConfirmPurge(false);
        setPurgeLoading(true);
        setMessage(null);
        try {
            console.log('[Security] Executing onPurgeData');
            await onPurgeData();
            setMessage({ type: 'success', text: 'Todos os dados foram apagados com sucesso.' });
        } catch (e: any) {
            console.error('[Security] Purge error:', e);
            setMessage({ type: 'error', text: e.message || 'Falha ao apagar dados.' });
        } finally {
            setPurgeLoading(false);
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
                                <i className="fas fa-shield-halved text-[var(--primary)]"></i>
                                Segurança
                            </h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Sua conta e acesso</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"
                        >
                            <i className="fas fa-times text-lg"></i>
                        </button>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                                    <i className="fas fa-envelope text-xl"></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">E-mail de Acesso</p>
                                    <p className="text-sm font-bold text-[var(--color-text)] tracking-tight truncate">{userEmail || 'Não disponível'}</p>
                                    {lastSignIn && (
                                        <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Último acesso: {new Date(lastSignIn).toLocaleString('pt-BR')}</p>
                                    )}
                                </div>
                            </div>

                            {!showDirectChange ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setShowDirectChange(true)}
                                        className="w-full py-4 rounded-2xl bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        <i className="fas fa-pen-to-square"></i>
                                        Alterar Senha Agora
                                    </button>

                                    <button
                                        onClick={handleResetPassword}
                                        disabled={loading || !userEmail}
                                        className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-[11px] font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                                        Receber link por e-mail
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleUpdatePassword} className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                                            <input
                                                type="password"
                                                placeholder="Nova senha"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--primary)]/50 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <i className="fas fa-check-double absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                                            <input
                                                type="password"
                                                placeholder="Confirmar nova senha"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--primary)]/50 transition-all font-medium"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setShowDirectChange(false); setMessage(null); }}
                                            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-[2] py-3 rounded-xl bg-[var(--primary)] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                                            Salvar Nova Senha
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>


                        <div className="pt-4 border-t border-white/5">
                            <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-4 px-2">Zona Perigosa</h4>

                            {showConfirmPurge ? (
                                <div className="p-6 rounded-3xl mb-4 bg-red-500/10 border border-red-500/20 animate-in zoom-in-95 duration-200">
                                    <p className="text-xs font-bold text-red-500 mb-4 leading-relaxed">
                                        ATENÇÃO: Isso apagará TODOS os seus dados financeiros permanentemente. Deseja continuar?
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowConfirmPurge(false)}
                                            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={confirmPurge}
                                            className="flex-[2] py-3 rounded-xl bg-red-500 text-white text-xs font-bold transition-all hover:bg-red-600 shadow-lg shadow-red-500/20"
                                        >
                                            Sim, Apagar Tudo
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handlePurgeClick}
                                    disabled={purgeLoading || !onPurgeData}
                                    className="w-full py-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-500 text-sm font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {purgeLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash-can"></i>}
                                    Apagar Todos os Dados
                                </button>
                            )}
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default SecurityModal;
