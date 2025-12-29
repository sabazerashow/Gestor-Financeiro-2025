import supabase, { isSupabaseEnabled } from './supabase';
import type { Transaction, RecurringTransaction, Bill, Payslip, Budget, FinancialGoal } from '@/types';

export const withSupabase = <T>(fn: () => Promise<T>): Promise<T> => {
  if (!isSupabaseEnabled) throw new Error('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  return fn();
};

// Auth helpers
export async function getSession() {
  if (!isSupabaseEnabled) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function signInWithEmailLink(email: string) {
  return withSupabase(async () => {
    const { data, error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw error;
    return data;
  });
}

export async function signUpWithEmail(email: string, password: string) {
  return withSupabase(async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  });
}

export async function signInWithEmail(email: string, password: string) {
  return withSupabase(async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  });
}

export async function signOut() {
  return withSupabase(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  });
}

export async function signInWithGoogle() {
  return withSupabase(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;

    // Providenciando redirecionamento manual caso o SDK não o faça automaticamente no ambiente atual
    if (data?.url) {
      window.location.href = data.url;
    }

    return data;
  });
}

export async function signInWithGithub() {
  return withSupabase(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  });
}

// Accounts helpers (workspaces)
export async function ensureDefaultAccount(userId: string): Promise<{ accountId: string; name: string }> {
  return withSupabase(async () => {
    console.log('DB: Verificando membresia para user:', userId);
    const { data: memberships, error: memErr } = await supabase
      .from('account_members')
      .select('account_id, role')
      .eq('user_id', userId)
      .limit(1);
    if (memErr) {
      console.error('DB: Erro ao buscar memberships:', memErr);
      throw memErr;
    }

    if (memberships && memberships.length > 0) {
      const accountId = memberships[0].account_id as string;
      const { data: acc, error: accErr } = await supabase
        .from('accounts')
        .select('id, name')
        .eq('id', accountId)
        .single();
      if (accErr) throw accErr;
      return { accountId: acc.id as string, name: (acc as any).name as string };
    }

    // 2. Se não for membro, verifica se tem um convite pendente pelo e-mail
    const { data: user } = await supabase.auth.getUser();
    const userEmail = user?.user?.email;

    if (userEmail) {
      const { data: invite, error: inviteErr } = await supabase
        .from('pending_invites')
        .select('account_id, role, id')
        .eq('email', userEmail)
        .limit(1)
        .maybeSingle();

      if (!inviteErr && invite) {
        // Aceita o convite: cria o vínculo e remove o convite
        const { error: linkErr } = await supabase
          .from('account_members')
          .insert({ account_id: invite.account_id, user_id: userId, role: invite.role });

        if (!linkErr) {
          await supabase.from('pending_invites').delete().eq('id', invite.id);

          const { data: acc } = await supabase
            .from('accounts')
            .select('id, name')
            .eq('id', invite.account_id)
            .single();

          return { accountId: invite.account_id, name: (acc as any).name || 'Conta Compartilhada' };
        }
      }
    }

    console.log('DB: Nenhuma conta encontrada. Criando conta pessoal...');
    const { data: createdAcc, error: createErr } = await supabase
      .from('accounts')
      .insert({ name: 'Meu Financeiro', type: 'personal', created_by: userId })
      .select('id, name')
      .single();
    if (createErr) {
      console.error('DB: Erro ao criar conta:', createErr);
      throw createErr;
    }
    const accountId = (createdAcc as any).id as string;

    console.log('DB: Vinculando usuário como owner da conta:', accountId);
    const { error: addMemErr } = await supabase
      .from('account_members')
      .insert({ account_id: accountId, user_id: userId, role: 'owner' });
    if (addMemErr) {
      console.error('DB: Erro ao vincular membro owner:', addMemErr);
      throw addMemErr;
    }

    return { accountId, name: (createdAcc as any).name as string };
  });
}

// Tables
type TableName = 'transactions' | 'recurring_transactions' | 'bills' | 'payslips' | 'budgets' | 'financial_goals';

export async function fetchAll<T>(table: TableName, accountId?: string): Promise<T[]> {
  return withSupabase(async () => {
    const query = supabase.from(table).select('*');
    const { data, error } = accountId ? await query.eq('account_id', accountId) : await query;
    if (error) {
      console.error(`DB: Fetch Error from ${table}:`, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        accountId
      });
      if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message.includes('not found')) {
        console.warn(`DB: Table ${table} not found or inaccessible, returning empty array.`);
        return [];
      }
      throw error;
    }
    return (data ?? []).map(row => mapKeysToCamelCase(row)) as T[];
  });
}

const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const toCamelCase = (str: string) => str.replace(/_([a-z])/g, g => g[1].toUpperCase());

const mapKeysToCamelCase = (obj: any): any => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = toCamelCase(key);
      const value = obj[key];
      // Special handling for installmentDetails if it's nested
      newObj[camelKey] = (key === 'installment_details' && value) ? mapKeysToCamelCase(value) : value;
    }
  }

  // Log critical fields to debug report issues
  if ('payment_method' in obj || 'paymentMethod' in newObj) {
    console.log('[DB] Mapped keys (Camel):', {
      raw: obj.payment_method,
      mapped: newObj.paymentMethod,
      allKeys: Object.keys(newObj)
    });
  }

  return newObj;
};

const mapKeysToSnakeCase = (obj: any) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const newObj: any = {};
  const excludedKeys = ['createdByName']; // Prevent sending columns that don't exist in DB
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && !excludedKeys.includes(key)) {
      // Map key and handle nested installmentDetails specifically if it exists
      const value = obj[key];
      newObj[toSnakeCase(key)] = (key === 'installmentDetails' && value) ? mapKeysToSnakeCase(value) : value;
    }
  }

  // Log to debug why paymentMethod might be null
  if ('paymentMethod' in obj) {
    if (obj.paymentMethod === null || obj.paymentMethod === undefined) {
      console.warn('[DB] Warning: paymentMethod is empty in object to be saved', obj.description);
    }
  }

  return newObj;
};

export async function bulkUpsert<T extends { id: string }>(table: TableName, rows: T[], accountId?: string) {
  return withSupabase(async () => {
    if (!rows || rows.length === 0) return;
    const payload = rows.map((r: any) => {
      const mapped = mapKeysToSnakeCase(r);
      // Ensure account_id is present
      if (accountId && !mapped.account_id) {
        mapped.account_id = accountId;
      }
      return mapped;
    });
    const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error(`DB: Bulk Upsert Error in ${table}:`, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        payloadSize: payload.length
      });
      throw error;
    }
  });
}

// Convenience wrappers com tipos
export const db = {
  fetchTransactions: (accountId?: string) => fetchAll<Transaction>('transactions', accountId),
  fetchRecurring: (accountId?: string) => fetchAll<RecurringTransaction>('recurring_transactions', accountId),
  fetchBills: (accountId?: string) => fetchAll<Bill>('bills', accountId),
  fetchPayslips: (accountId?: string) => fetchAll<Payslip>('payslips', accountId),
  upsertTransactions: (rows: Transaction[], accountId?: string) => bulkUpsert('transactions', rows, accountId),
  upsertRecurring: (rows: RecurringTransaction[], accountId?: string) => bulkUpsert('recurring_transactions', rows, accountId),
  upsertBills: (rows: Bill[], accountId?: string) => bulkUpsert('bills', rows, accountId),
  upsertPayslips: (rows: Payslip[], accountId?: string) => bulkUpsert('payslips', rows, accountId),
  fetchBudgets: (accountId?: string) => fetchAll<Budget>('budgets', accountId),
  upsertBudgets: (rows: Budget[], accountId?: string) => bulkUpsert('budgets', rows, accountId),
  fetchGoals: (accountId?: string) => fetchAll<FinancialGoal>('financial_goals', accountId),
  upsertGoals: (rows: FinancialGoal[], accountId?: string) => bulkUpsert('financial_goals', rows, accountId),
  fetchUserProfile: (userId: string) => withSupabase(async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data;
  }),
  upsertUserProfile: (profile: any) => withSupabase(async () => {
    const { error } = await supabase.from('profiles').upsert(profile);
    if (error) throw error;
  }),
  fetchMyInvites: (email: string) => fetchMyInvites(email),
  acceptInvite: (inviteId: string, userId: string) => acceptInvite(inviteId, userId),
};

export default db;

// Danger zone: purge all account data (transactions, recurring, bills, payslips, budgets, goals)
export async function purgeAccountData(accountId: string) {
  return withSupabase(async () => {
    const tables: TableName[] = ['transactions', 'recurring_transactions', 'bills', 'payslips', 'budgets', 'financial_goals'];
    for (const t of tables) {
      try {
        const { error } = await supabase.from(t).delete().eq('account_id', accountId);
        // Ignore error 404/PGRST116 (table not found) or similar schema cache issues
        if (error) {
          console.warn(`DB: Non-critical error while purging ${t}:`, error.message);
        }
      } catch (e: any) {
        console.warn(`DB: Failed to purge table ${t}, skipping...`, e.message);
      }
    }
  });
}

// Members & Invites helpers
export async function fetchAccountMembers(accountId: string) {
  return withSupabase(async () => {
    // Busca membros sem join para evitar erro de relacionamento no cache do Supabase
    const { data: members, error: memErr } = await supabase
      .from('account_members')
      .select('id, user_id, role, created_at')
      .eq('account_id', accountId)
      .order('created_at', { ascending: true });

    if (memErr) throw memErr;
    if (!members || members.length === 0) return [];

    // Busca perfis separadamente
    const userIds = members.map(m => m.user_id);
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds);

    if (profErr) {
      console.warn('DB: Erro ao buscar perfis dos membros:', profErr.message);
      return members;
    }

    // Mescla perfis com membros em memória
    return members.map(m => ({
      ...m,
      profiles: profiles?.find(p => p.id === m.user_id) || null
    }));
  });
}

export async function fetchMyInvites(email: string) {
  return withSupabase(async () => {
    const { data, error } = await supabase
      .from('pending_invites')
      .select('*, accounts(name)')
      .eq('email', email);
    if (error) throw error;
    return (data ?? []) as any;
  });
}

export async function acceptInvite(inviteId: string, userId: string) {
  return withSupabase(async () => {
    const { data: invite, error: fetchErr } = await supabase
      .from('pending_invites')
      .select('*')
      .eq('id', inviteId)
      .single();
    if (fetchErr || !invite) throw new Error('Convite não encontrado');

    // Verifica se já é membro antes de inserir para evitar Unique Constraint Error
    const { data: existingMember } = await supabase
      .from('account_members')
      .select('id')
      .eq('account_id', invite.account_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      // Se já for membro, apenas apaga o convite e retorna o account_id
      await supabase.from('pending_invites').delete().eq('id', inviteId);
      return invite.account_id;
    }

    const { error: memErr } = await supabase
      .from('account_members')
      .insert({
        account_id: invite.account_id,
        user_id: userId,
        role: invite.role
      });
    if (memErr) throw memErr;

    await supabase.from('pending_invites').delete().eq('id', inviteId);
    return invite.account_id;
  });
}

export async function fetchPendingInvites(accountId: string): Promise<Array<{ id: string; email: string; role: string; created_at?: string }>> {
  return withSupabase(async () => {
    const { data, error } = await supabase
      .from('pending_invites')
      .select('id, email, role, created_at')
      .eq('account_id', accountId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as any;
  });
}

export async function createInvite(accountId: string, email: string, role: string = 'member') {
  return withSupabase(async () => {
    const { error } = await supabase
      .from('pending_invites')
      .insert({ account_id: accountId, email, role });
    if (error) throw error;
  });
}

export async function revokeInvite(inviteId: string) {
  return withSupabase(async () => {
    const { error } = await supabase
      .from('pending_invites')
      .delete()
      .eq('id', inviteId);
    if (error) throw error;
  });
}
