
import React, { useState } from 'react';
import supabase from '@/lib/supabase';

interface SecurityModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail?: string;
}

const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose, userEmail }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-[var(--background)] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 animate-in fade-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
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
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400">
                                    <i className="fas fa-envelope text-xl"></i>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">E-mail de Acesso</p>
                                    <p className="text-sm font-bold text-white tracking-tight">{userEmail || 'Não disponível'}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleResetPassword}
                                disabled={loading || !userEmail}
                                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                    <i className="fas fa-key"></i>
                                )}
                                Alterar Senha
                            </button>
                            <p className="text-[10px] text-gray-500 font-medium text-center mt-4">
                                Enviaremos um link para criar uma nova senha no seu e-mail.
                            </p>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl">
                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <i className="fas fa-fingerprint"></i>
                                Dica de Segurança
                            </h4>
                            <p className="text-xs text-amber-500/80 font-medium leading-relaxed">
                                Sempre utilize senhas fortes e evite repetir senhas usadas em outros serviços. O Finance Pilot utiliza criptografia de ponta a ponta via Supabase Auth.
                            </p>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default SecurityModal;
