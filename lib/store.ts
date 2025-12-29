import { create } from 'zustand';
import { Transaction, RecurringTransaction, Bill, Payslip, Account, Budget, FinancialGoal } from '../types';
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
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
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
    setUserProfile: (userProfile) => {
        if (userProfile) localStorage.setItem('userProfile', JSON.stringify(userProfile));
        set({ userProfile });
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
            const [tx, rec, bl, ps, bd, gl] = await Promise.all([
                db.fetchTransactions(accountId),
                db.fetchRecurring(accountId),
                db.fetchBills(accountId),
                db.fetchPayslips(accountId),
                db.fetchBudgets(accountId),
                db.fetchGoals(accountId),
            ]);
            set({
                transactions: (tx as any) || [],
                recurringTransactions: (rec as any) || [],
                bills: (bl as any) || [],
                payslips: (ps as any) || [],
                budgets: (bd as any) || [],
                goals: (gl as any) || []
            });
        } catch (e) {
            console.error('Store: Falha ao buscar dados', e);
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
        }
    }
}));
