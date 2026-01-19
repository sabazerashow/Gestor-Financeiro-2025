import { create } from 'zustand';
import { Transaction, RecurringTransaction, Bill, Payslip, Account, Budget, FinancialGoal, PaymentMethod } from '../types';
import { db } from './db';

interface FinanceState {
    transactions: Transaction[];
    recurringTransactions: RecurringTransaction[];
    bills: Bill[];
    payslips: Payslip[];
    budgets: Budget[];
    goals: FinancialGoal[];
    userProfile: any;
    accountId: string | null;
    accountName: string | null;
    session: any | null;
    isAuthActive: boolean;

    // Actions
    setSession: (session: any) => void;
    setAccountId: (id: string | null) => void;
    setAccountName: (name: string | null) => void;
    setUserProfile: (profile: any) => void;

    setTransactions: (val: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
    setRecurringTransactions: (val: RecurringTransaction[] | ((prev: RecurringTransaction[]) => RecurringTransaction[])) => void;
    setBills: (val: Bill[] | ((prev: Bill[]) => Bill[])) => void;
    setPayslips: (val: Payslip[] | ((prev: Payslip[]) => Payslip[])) => void;
    setBudgets: (val: Budget[] | ((prev: Budget[]) => Budget[])) => void;
    setGoals: (val: FinancialGoal[] | ((prev: FinancialGoal[]) => FinancialGoal[])) => void;

    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;

    updateBill: (id: string, updates: Partial<Bill>) => void;
    // Hydration / Sync
    fetchData: (accountId: string) => Promise<void>;
    syncData: (accountId: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
    transactions: [],
    recurringTransactions: [],
    bills: [],
    payslips: [],
    budgets: [],
    goals: [],
    userProfile: (() => {
        try {
            const saved = localStorage.getItem('userProfile');
            return saved ? JSON.parse(saved) : { name: '', email: '', dob: '', gender: 'Outro', photo: '' };
        } catch { return { name: '', email: '', dob: '', gender: 'Outro', photo: '' }; }
    })(),
    accountId: localStorage.getItem('accountId') || null,
    accountName: localStorage.getItem('accountName') || null,
    session: null,
    isAuthActive: true,

    setSession: (session) => set({ session }),
    setAccountId: (accountId) => {
        if (accountId) localStorage.setItem('accountId', accountId);
        else localStorage.removeItem('accountId');
        set({ accountId });
    },
    setAccountName: (accountName) => {
        if (accountName) localStorage.setItem('accountName', accountName);
        else localStorage.removeItem('accountName');
        set({ accountName });
    },
    setUserProfile: (update) => {
        set((state) => {
            const nextProfile = typeof update === 'function' ? update(state.userProfile) : update;
            if (nextProfile) localStorage.setItem('userProfile', JSON.stringify(nextProfile));
            return { userProfile: nextProfile };
        });
    },

    setTransactions: (val) => set((state) => ({
        transactions: typeof val === 'function' ? val(state.transactions) : val
    })),
    setRecurringTransactions: (val) => set((state) => ({
        recurringTransactions: typeof val === 'function' ? val(state.recurringTransactions) : val
    })),
    setBills: (val) => set((state) => ({
        bills: typeof val === 'function' ? val(state.bills) : val
    })),
    setPayslips: (val) => set((state) => ({
        payslips: typeof val === 'function' ? val(state.payslips) : val
    })),
    setBudgets: (val) => set((state) => ({
        budgets: typeof val === 'function' ? val(state.budgets) : val
    })),
    setGoals: (val) => set((state) => ({
        goals: typeof val === 'function' ? val(state.goals) : val
    })),

    fetchData: async (accountId) => {
        try {
            // Using individual try-catches implicitly via db.fetch* wrappers (which handle PGRST205 now)
            // But we still want a safe Promise.all execution.
            const fetches = [
                db.fetchTransactions(accountId).catch(() => []),
                db.fetchRecurring(accountId).catch(() => []),
                db.fetchBills(accountId).catch(() => []),
                db.fetchPayslips(accountId).catch(() => []),
                db.fetchBudgets(accountId).catch(() => []),
                db.fetchGoals(accountId).catch(() => []),
            ];

            const [tx, rec, bl, ps, bd, gl] = await Promise.all(fetches);

            // Ensure all transactions have a paymentMethod for filtering stability
            const sanitizedTransactions = (tx as any || []).map((t: any) => ({
                ...t,
                paymentMethod: t.paymentMethod || PaymentMethod.OUTRO
            }));

            set({
                transactions: sanitizedTransactions,
                recurringTransactions: (rec as any) || [],
                bills: (bl as any) || [],
                payslips: (ps as any) || [],
                budgets: (bd as any) || [],
                goals: (gl as any) || []
            });
        } catch (e) {
            console.error('Store: Falha crítica ao buscar dados', e);
        }
    },

    updateTransaction: (id, updates) => set((state) => ({
        transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
    })),

    deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
    })),

    updateBill: (id, updates) => set((state) => {
        const updatedBills = state.bills.map(b => b.id === id ? { ...b, ...updates } : b);

        // Se mudou algo no billing que afeta a recorrência (valor, categoria, subcategoria)
        // e essa conta tem uma recorrência vinculada, precisamos avisar/atualizar
        // Para simplificar agora, apenas atualizamos a lista de contas.

        return { bills: updatedBills };
    }),

    syncData: async (accountId) => {
        if (!accountId) return;
        const { transactions, recurringTransactions, bills, payslips, budgets, goals } = get();
        try {
            await Promise.all([
                db.upsertTransactions(transactions as any, accountId),
                db.upsertRecurring(recurringTransactions as any, accountId),
                db.upsertBills(bills as any, accountId),
                db.upsertPayslips(payslips as any, accountId),
                db.upsertBudgets(budgets as any, accountId),
                db.upsertGoals(goals as any, accountId),
            ]);
        } catch (e) {
            console.error('Store: Falha ao sincronizar dados', e);
            throw e;
        }
    }
}));
