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
    if (error) throw error;
    return (data ?? []) as T[];
  });
}
const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const mapKeysToSnakeCase = (obj: any) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const newObj: any = {};
  const excludedKeys = ['createdBy', 'createdByName']; // Prevent sending columns that don't exist in DB
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && !excludedKeys.includes(key)) {
      // Map key and handle nested installmentDetails specifically if it exists
      const value = obj[key];
      newObj[toSnakeCase(key)] = (key === 'installmentDetails' && value) ? mapKeysToSnakeCase(value) : value;
    }
  }
  return newObj;
};

export async function bulkUpsert<T extends { id: string }>(table: TableName, rows: T[], accountId?: string) {
  return withSupabase(async () => {
    if (!rows || rows.length === 0) return;
    const payload = rows.map((r: any) => {
      const mapped = mapKeysToSnakeCase(r);
      return (accountId && !('account_id' in mapped) ? { ...mapped, account_id: accountId } : mapped);
    });
    const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error(`DB: Error upserting to ${table}:`, error);
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
export async function fetchAccountMembers(accountId: string): Promise<Array<{ id: string; user_id: string; role: string; created_at?: string }>> {
  return withSupabase(async () => {
    const { data, error } = await supabase
      .from('account_members')
      .select('id, user_id, role, created_at')
      .eq('account_id', accountId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as any;
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
