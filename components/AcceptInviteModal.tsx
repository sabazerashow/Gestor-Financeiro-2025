import React, { useState } from 'react';
import { acceptInvite } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingInvite {
    id: string;
    account_id: string;
    role: string;
    accounts: {
        name: string;
    };
}

interface AcceptInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    invites: PendingInvite[];
    userId: string;
    onAccepted: (accountId: string) => void;
}

const AcceptInviteModal: React.FC<AcceptInviteModalProps> = ({ isOpen, onClose, invites, userId, onAccepted }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAccept = async (inviteId: string) => {
        setLoading(true);
        setError(null);
        try {
            const accountId = await acceptInvite(inviteId, userId);
            onAccepted(accountId);
            onClose();
        } catch (e: any) {
            setError(e.message || 'Falha ao aceitar convite');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || invites.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
            >
                <div className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 mx-auto">
                        <i className="fas fa-envelope-open-text text-2xl"></i>
                    </div>

                    <h2 className="text-2xl font-black text-center text-gray-900 mb-2">Convite Recebido!</h2>
                    <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
                        Você foi convidado para gerenciar as finanças em conjunto. Deseja aceitar?
                    </p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-500 text-xs font-bold border border-red-100 flex items-center gap-3">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {invites.map((invite) => (
                            <div key={invite.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{invite.accounts?.name || 'Conta Compartilhada'}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Nível: {invite.role}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <button
                                        onClick={onClose}
                                        className="py-3 px-4 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-100 transition-all active:scale-[0.98]"
                                    >
                                        Agora não
                                    </button>
                                    <button
                                        disabled={loading}
                                        onClick={() => handleAccept(invite.id)}
                                        className="py-3 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
                                        Aceitar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AcceptInviteModal;
