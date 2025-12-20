import React, { useEffect, useState } from 'react';
import { fetchAccountMembers, fetchPendingInvites, createInvite, revokeInvite } from '@/lib/db';
import { isAuthActive, isSupabaseEnabled } from '@/lib/supabase';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile?: () => void;
  accountId?: string | null;
  hasSession?: boolean;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onOpenProfile, accountId, hasSession }) => {
  console.log('InviteModal: accountId recebido:', accountId);
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
      alert('Convite enviado com sucesso!');
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
    <div className="fixed inset-0 bg-[var(--overlay)] z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-2xl border border-[var(--border)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] mr-4 shadow-lg shadow-[var(--primary)]/20">
              <i className="fas fa-user-plus text-lg"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--color-text)]">Compartilhar Conta</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Convide seu parceiro(a) para gerenciar as finanças juntos.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-8">
          {!accountId && (
            <div className="mb-6 p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex flex-col gap-4">
              {hasSession ? (
                <div className="flex items-center gap-4 py-2">
                  <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center animate-pulse">
                    <i className="fas fa-spinner fa-spin text-lg"></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-orange-700">Configurando sua conta...</h4>
                    <p className="text-xs text-orange-600/80 leading-relaxed mt-1">
                      Estamos verificando sua conta na nuvem. Isso deve levar apenas alguns segundos.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                      <i className="fas fa-exclamation-triangle text-lg"></i>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-orange-700">Atenção: Compartilhamento Desativado</h4>
                      {!isSupabaseEnabled ? (
                        <p className="text-xs text-orange-600/80 leading-relaxed mt-1">
                          O serviço de nuvem (Supabase) não foi detectado. Para compartilhar sua conta com outras pessoas, você precisa configurar as chaves de API no servidor.
                          Sem a nuvem, seus dados ficam salvos apenas neste dispositivo.
                        </p>
                      ) : (
                        <p className="text-xs text-orange-600/80 leading-relaxed mt-1">
                          Para usar a <strong>Conta Família</strong>, você precisa estar logado. Isso permite que seus dados sejam sincronizados com segurança na nuvem para que outras pessoas também possam vê-los.
                        </p>
                      )}
                    </div>
                  </div>

                  {isSupabaseEnabled && onOpenProfile && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenProfile();
                      }}
                      className="w-full py-2.5 text-xs font-black uppercase tracking-widest rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                      <i className="fas fa-sign-in-alt mr-2"></i> Ir para Login / Perfil
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--danger)]/10 text-[var(--danger-foreground)] border border-[var(--danger)]/20 flex items-start gap-3">
              <i className="fas fa-times-circle mt-1"></i>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <h4 className="flex items-center text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                  <i className="fas fa-envelope-open-text mr-2 text-[var(--primary)]"></i> Novo Convite
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 opacity-70">E-mail da pessoa</label>
                    <input
                      type="email"
                      placeholder="ex: geovanna@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 opacity-70">Nível de Acesso</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="member">Membro (Editor)</option>
                      <option value="admin">Administrador (Total)</option>
                      <option value="viewer">Leitor (Apenas Visualização)</option>
                    </select>
                  </div>
                  <button
                    disabled={!accountId || loading || !email}
                    onClick={handleInvite}
                    className="w-full px-5 py-3 text-sm font-bold rounded-xl text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-[var(--primary)]/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-paper-plane"></i>}
                    Enviar Convite
                  </button>
                </div>
              </div>

              <div>
                <h4 className="flex items-center text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                  <i className="fas fa-hourglass-half mr-2 text-orange-500"></i> Pendentes
                </h4>
                <div className="space-y-2 max-h-40 overflow-auto pr-2 custom-scrollbar">
                  {invites.length === 0 ? (
                    <div className="text-center py-6 bg-[var(--surface)] rounded-xl border border-dashed border-[var(--border)]">
                      <p className="text-xs text-[var(--color-text-muted)] italic">Nenhum convite em aberto.</p>
                    </div>
                  ) : invites.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 hover:shadow-md transition-all group">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--color-text)] truncate max-w-[150px]">{inv.email}</span>
                        <span className="text-[10px] uppercase font-black text-[var(--color-text-muted)] tracking-tighter">{inv.role}</span>
                      </div>
                      <button
                        className="p-2 text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded-lg transition-all"
                        onClick={() => handleRevoke(inv.id)}
                        title="Revogar convite"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="flex items-center text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                <i className="fas fa-users-cog mr-2 text-[var(--primary)]"></i> Membros Ativos
              </h4>
              <div className="space-y-3 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                {members.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">Nenhum membro ativo.</p>
                ) : members.map(m => (
                  <div key={m.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold">
                        {m.user_id.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--color-text)] truncate max-w-[120px]">{m.user_id}</div>
                        <div className="text-[10px] uppercase font-black text-[var(--primary)] tracking-widest">{m.role}</div>
                      </div>
                    </div>
                    {m.role === 'owner' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold">Dono</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-[11px] text-blue-500/80 leading-relaxed italic">
                  <i className="fas fa-info-circle mr-1"></i>
                  Para que outra pessoa veja seus dados, ela deve criar uma conta com o e-mail convidado e aceitar o vínculo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[var(--surface)] border-t border-[var(--border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold rounded-xl text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] shadow-lg shadow-[var(--primary)]/10 transition-all active:scale-[0.95]"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
