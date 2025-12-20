
import { supabase } from './supabase';

export const db = {
    fetchTransactions: async (accountId) => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('account_id', accountId)
            .order('date', { ascending: false });
        if (error) throw error;
        return data;
    },

    fetchRecurring: async (accountId) => {
        const { data, error } = await supabase
            .from('recurring_transactions')
            .select('*')
            .eq('account_id', accountId);
        if (error) throw error;
        return data;
    },

    fetchBills: async (accountId) => {
        const { data, error } = await supabase
            .from('bills')
            .select('*')
            .eq('account_id', accountId);
        if (error) throw error;
        return data;
    },

    fetchPayslips: async (accountId) => {
        const { data, error } = await supabase
            .from('payslips')
            .select('*')
            .eq('account_id', accountId);
        if (error) throw error;
        return data;
    },

    resetAccountData: async (accountId) => {
        const tables = ['transactions', 'bills'];
        let totalDeleted = 0;
        for (const table of tables) {
            const { data, error, count } = await supabase
                .from(table)
                .delete({ count: 'exact' })
                .eq('account_id', accountId)
                .select(); // select() ensures we get data back which helps verify result

            if (error) throw error;
            console.log(`[DB] Deleted ${count || data?.length || 0} rows from ${table}`);
            totalDeleted += (count || data?.length || 0);
        }
        return totalDeleted;
    },

    addTransaction: async (accountId, transaction) => {
        const { data, error } = await supabase
            .from('transactions')
            .insert({ ...transaction, account_id: accountId })
            .select()
            .single();
        if (error) {
            console.error('Supabase Insert Error:', error);
            throw error;
        }
        return data;
    },

    addBill: async (accountId, bill) => {
        const { data, error } = await supabase
            .from('bills')
            .insert({ ...bill, account_id: accountId })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    importTransactions: async (accountId, transactions) => {
        const formatted = transactions.map(tx => ({
            ...tx,
            account_id: accountId,
            // Strip client-side IDs if they exist to let DB generate or ensure consistency
            id: tx.id || undefined
        }));
        const { data, error } = await supabase
            .from('transactions')
            .insert(formatted)
            .select();
        if (error) throw error;
        return data;
    },

    updateTransaction: async (id, updates) => {
        const { data, error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    deleteTransaction: async (id) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    ensureDefaultAccount: async (userId) => {
        // Mesma lógica da web para garantir que o usuário tenha uma conta
        const { data: memberships, error: memErr } = await supabase
            .from('account_members')
            .select('account_id, role')
            .eq('user_id', userId)
            .limit(1);

        if (memErr) throw memErr;

        if (memberships && memberships.length > 0) {
            const accountId = memberships[0].account_id;
            const { data: acc, error: accErr } = await supabase
                .from('accounts')
                .select('id, name')
                .eq('id', accountId)
                .single();
            if (accErr) throw accErr;
            return { accountId: acc.id, name: acc.name };
        }

        // Criar se não existir (fallback)
        const { data: createdAcc, error: createErr } = await supabase
            .from('accounts')
            .insert({ name: 'Meu Financeiro', type: 'personal', created_by: userId })
            .select('id, name')
            .single();
        if (createErr) throw createErr;

        await supabase
            .from('account_members')
            .insert({ account_id: createdAcc.id, user_id: userId, role: 'owner' });

        return { accountId: createdAcc.id, name: createdAcc.name };
    },

    fetchProfile: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    updateProfile: async (userId, updates) => {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...updates })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    fetchAccountMembers: async (accountId) => {
        const { data, error } = await supabase
            .from('account_members')
            .select('id, user_id, role')
            .eq('account_id', accountId);
        if (error) throw error;
        return data;
    },

    fetchPendingInvites: async (accountId) => {
        const { data, error } = await supabase
            .from('invites')
            .select('*')
            .eq('account_id', accountId)
            .eq('status', 'pending');
        if (error) throw error;
        return data;
    },

    createInvite: async (accountId, email, role = 'member') => {
        const { data, error } = await supabase
            .from('invites')
            .insert({ account_id: accountId, email, role, status: 'pending' })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    revokeInvite: async (inviteId) => {
        const { error } = await supabase
            .from('invites')
            .delete()
            .eq('id', inviteId);
        if (error) throw error;
        return true;
    }
};
