
import React, { useEffect, useState } from 'react';
import { fetchAccountMembers, fetchPendingInvites, createInvite, revokeInvite } from '@/lib/db';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId?: string | null;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, accountId }) => {
  if (!isOpen) return null;

  const [members, setMembers] = useState<Array<{ id: string; user_id: string; role: string }>>([]);
  const [invites, setInvites] = useState<Array<{ id: string; email: string; role: string }>>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'admin' | 'viewer'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const [m, i] = await Promise.all([
        fetchAccountMembers(accountId),
        fetchPendingInvites(accountId),
      ]);
      setMembers(m);
      setInvites(i);
    } catch (e: any) {
      setError(e?.message || 'Falha ao carregar membros/convites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, accountId]);

  const handleInvite = async () => {
    if (!accountId || !email) return;
    setLoading(true);
    setError(null);
    try {
      await createInvite(accountId, email, role);
      setEmail('');
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Falha ao criar convite');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await revokeInvite(id);
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Falha ao revogar convite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 mr-3">
              <i className="fas fa-users text-blue-600 dark:text-blue-300"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gerenciar Membros</h3>
          </div>

          {!accountId && (
            <div className="mb-3 text-sm text-yellow-700 bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-200 p-2 rounded">
              Autentique-se para habilitar convites e membros.
            </div>
          )}
          {error && (
            <div className="mb-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-200 p-2 rounded">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Convidar Usuário</h4>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm"
                >
                  <option value="member">Membro</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Leitor</option>
                </select>
                <button
                  disabled={!accountId || loading || !email}
                  onClick={handleInvite}
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  Enviar Convite
                </button>
              </div>

              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">Convites Pendentes</h4>
              <div className="space-y-2 max-h-48 overflow-auto">
                {invites.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">Nenhum convite pendente.</p>
                ) : invites.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-md px-3 py-2">
                    <div className="text-sm">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{inv.email}</div>
                      <div className="text-gray-500 dark:text-gray-400">{inv.role}</div>
                    </div>
                    <button
                      className="text-red-600 text-sm hover:underline"
                      onClick={() => handleRevoke(inv.id)}
                    >
                      Revogar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Membros</h4>
              <div className="space-y-2 max-h-64 overflow-auto">
                {members.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">Nenhum membro.</p>
                ) : members.map(m => (
                  <div key={m.id} className="bg-gray-50 dark:bg-gray-700 rounded-md px-3 py-2">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.user_id}</div>
                    <div className="text-gray-500 dark:text-gray-400">{m.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
