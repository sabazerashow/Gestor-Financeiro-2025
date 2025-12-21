import { supabase } from './supabase';

const toSnakeCase = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const mapKeysToSnakeCase = (obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    const newObj = {};
    const excludedKeys = ['createdBy', 'createdByName']; // Prevent sending columns that don't exist in DB
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && !excludedKeys.includes(key)) {
            const value = obj[key];
            newObj[toSnakeCase(key)] = (key === 'installmentDetails' && value) ? mapKeysToSnakeCase(value) : value;
        }
    }
    return newObj;
};

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
        const mapped = mapKeysToSnakeCase(transaction);
        const { data, error } = await supabase
            .from('transactions')
            .insert({ ...mapped, account_id: accountId })
            .select()
            .single();
        if (error) {
            console.error('Supabase Insert Error:', error);
            throw error;
        }
        return data;
    },

    addBill: async (accountId, bill) => {
        const mapped = mapKeysToSnakeCase(bill);
        const { data, error } = await supabase
            .from('bills')
            .insert({ ...mapped, account_id: accountId })
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

    upsertTransactions: async (accountId, transactions) => {
        const formatted = transactions.map(tx => {
            const mapped = mapKeysToSnakeCase(tx);
            return { ...mapped, account_id: accountId };
        });
        const { data, error } = await supabase
            .from('transactions')
            .upsert(formatted)
            .select();
        if (error) throw error;
        return data;
    },

    upsertBills: async (accountId, bills) => {
        const formatted = bills.map(bill => {
            const mapped = mapKeysToSnakeCase(bill);
            return { ...mapped, account_id: accountId };
        });
        const { data, error } = await supabase
            .from('bills')
            .upsert(formatted)
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
        // 1. Verifica membros
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

        // 2. Verifica convites pendentes pelo e-mail
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
            const { data: invite, error: inviteErr } = await supabase
                .from('pending_invites')
                .select('account_id, role, id')
                .eq('email', user.email)
                .limit(1)
                .maybeSingle();

            if (!inviteErr && invite) {
                // Aceita convite
                await supabase.from('account_members').insert({
                    account_id: invite.account_id,
                    user_id: userId,
                    role: invite.role
                });
                await supabase.from('pending_invites').delete().eq('id', invite.id);

                const { data: acc } = await supabase
                    .from('accounts')
                    .select('id, name')
                    .eq('id', invite.account_id)
                    .single();

                return { accountId: invite.account_id, name: acc?.name || 'Conta Compartilhada' };
            }
        }

        // 3. Criar se não existir
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
            .from('pending_invites')
            .select('*')
            .eq('account_id', accountId);
        if (error) throw error;
        return data;
    },

    createInvite: async (accountId, email, role = 'member') => {
        const { data, error } = await supabase
            .from('pending_invites')
            .insert({ account_id: accountId, email, role })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    revokeInvite: async (inviteId) => {
        const { error } = await supabase
            .from('pending_invites')
            .delete()
            .eq('id', inviteId);
        if (error) throw error;
        return true;
    }
};
