import db from './db';
import { TransactionType, PaymentMethod, Transaction, Bill, Frequency } from '@/types';

const generateUUID = () => {
    // Check if crypto.randomUUID is available (modern browsers, secure context)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback: Simple but valid UUID v4 format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const seedMockData = async (accountId: string) => {
    if (!accountId) throw new Error('Account ID is required');

    console.log('[SEED] Starting robust population for account:', accountId);

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const mockTransactions: Transaction[] = [
        { id: generateUUID(), description: 'Salário Mensal', amount: 8500, type: TransactionType.INCOME, category: 'Receitas/Entradas', subcategory: 'BP', date: today, paymentMethod: PaymentMethod.PIX },
        { id: generateUUID(), description: 'Freelance Design', amount: 1200, type: TransactionType.INCOME, category: 'Receitas/Entradas', subcategory: 'Outras Receitas', date: today, paymentMethod: PaymentMethod.PIX },
        { id: generateUUID(), description: 'Aluguel Apartamento', amount: 2200, type: TransactionType.EXPENSE, category: 'Casa/Moradia', subcategory: 'Aluguel/Financiamento', date: today, paymentMethod: PaymentMethod.OUTRO },
        { id: generateUUID(), description: 'Supermercado Mensal', amount: 850.45, type: TransactionType.EXPENSE, category: 'Alimentação', subcategory: 'Supermercado', date: today, paymentMethod: PaymentMethod.DEBITO },
        { id: generateUUID(), description: 'Restaurante Fim de Semana', amount: 120.50, type: TransactionType.EXPENSE, category: 'Alimentação', subcategory: 'Refeições Fora', date: today, paymentMethod: PaymentMethod.PIX },
        { id: generateUUID(), description: 'Combustível', amount: 350.00, type: TransactionType.EXPENSE, category: 'Transporte', subcategory: 'Combustível/Manutenção', date: today, paymentMethod: PaymentMethod.DEBITO },
        { id: generateUUID(), description: 'Academia', amount: 159.90, type: TransactionType.EXPENSE, category: 'Saúde', subcategory: 'Academia', date: today, paymentMethod: PaymentMethod.DEBITO },
        { id: generateUUID(), description: 'Cinema e Pipoca', amount: 80.00, type: TransactionType.EXPENSE, category: 'Lazer', subcategory: 'Entretenimento', date: today, paymentMethod: PaymentMethod.DINHEIRO },
        { id: generateUUID(), description: 'Farmácia', amount: 45.90, type: TransactionType.EXPENSE, category: 'Saúde', subcategory: 'Medicamentos/Farmácia', date: today, paymentMethod: PaymentMethod.DEBITO },
    ];

    const mockBills: Bill[] = [
        { id: generateUUID(), description: 'Conta de Energia', dueDay: 10, amount: 250, isAutoDebit: false, category: 'Casa/Moradia', subcategory: 'Contas Domésticas' },
        { id: generateUUID(), description: 'Internet Fibra', dueDay: 15, amount: 99.90, isAutoDebit: true, category: 'Casa/Moradia', subcategory: 'Contas Domésticas' },
        { id: generateUUID(), description: 'Plano de Saúde', dueDay: 5, amount: 450, isAutoDebit: true, category: 'Saúde', subcategory: 'Planos/Seguros' },
    ];

    const mockRecurring = [
        { id: generateUUID(), description: 'Netflix', amount: 55.90, type: TransactionType.EXPENSE, category: 'Lazer', subcategory: 'Entretenimento', frequency: Frequency.MONTHLY, startDate: today, nextDueDate: today },
        { id: generateUUID(), description: 'Seguro Carro', amount: 180, type: TransactionType.EXPENSE, category: 'Transporte', subcategory: 'Seguros', frequency: Frequency.MONTHLY, startDate: today, nextDueDate: today },
    ];

    const mockBudgets = [
        { id: generateUUID(), category: 'Alimentação', amount: 1500, period: 'monthly' },
        { id: generateUUID(), category: 'Transporte', amount: 800, period: 'monthly' },
    ];

    const mockGoals = [
        { id: generateUUID(), title: 'Reserva de Emergência', target_amount: 10000, current_amount: 2500, color: '#10b981' },
        { id: generateUUID(), title: 'Viagem Japão', target_amount: 25000, current_amount: 1200, color: '#f59e0b' },
    ];

    const results = {
        transactions: false,
        bills: false,
        recurring: false,
        budgets: false,
        goals: false
    };

    // Helper to safely upsert and log
    const safeUpsert = async (name: string, fn: () => Promise<any>) => {
        try {
            await fn();
            console.log(`[SEED] Table ${name} seeded successfully`);
            return true;
        } catch (e: any) {
            console.warn(`[SEED] Failed to seed ${name}:`, e.message);
            return false;
        }
    };

    results.transactions = await safeUpsert('transactions', () => db.upsertTransactions(mockTransactions, accountId));
    results.bills = await safeUpsert('bills', () => db.upsertBills(mockBills, accountId));
    results.recurring = await safeUpsert('recurring_transactions', () => db.upsertRecurring(mockRecurring as any, accountId));
    results.budgets = await safeUpsert('budgets', () => db.upsertBudgets(mockBudgets as any, accountId));
    results.goals = await safeUpsert('financial_goals', () => db.upsertGoals(mockGoals as any, accountId));

    console.log('[SEED] Population summary:', results);

    // Return true if at least core data was seeded
    return results.transactions || results.bills;
};
