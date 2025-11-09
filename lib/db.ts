import supabase, { isSupabaseEnabled } from './supabase';
import type { Transaction, RecurringTransaction, Bill, Payslip } from '@/types';

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

// Tables
type TableName = 'transactions' | 'recurring_transactions' | 'bills' | 'payslips';

export async function fetchAll<T>(table: TableName): Promise<T[]> {
  return withSupabase(async () => {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return (data ?? []) as T[];
  });
}

export async function bulkUpsert<T extends { id: string }>(table: TableName, rows: T[]) {
  return withSupabase(async () => {
    if (!rows || rows.length === 0) return;
    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  });
}

// Convenience wrappers com tipos
export const db = {
  fetchTransactions: () => fetchAll<Transaction>('transactions'),
  fetchRecurring: () => fetchAll<RecurringTransaction>('recurring_transactions'),
  fetchBills: () => fetchAll<Bill>('bills'),
  fetchPayslips: () => fetchAll<Payslip>('payslips'),
  upsertTransactions: (rows: Transaction[]) => bulkUpsert('transactions', rows),
  upsertRecurring: (rows: RecurringTransaction[]) => bulkUpsert('recurring_transactions', rows),
  upsertBills: (rows: Bill[]) => bulkUpsert('bills', rows),
  upsertPayslips: (rows: Payslip[]) => bulkUpsert('payslips', rows),
};

export default db;
