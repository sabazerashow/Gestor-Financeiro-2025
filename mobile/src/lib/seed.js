
import { db } from './db';

export const seedMockData = async (accountId) => {
    if (!accountId) throw new Error('Account ID is required');

    const generateId = () => Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);

    const mockTransactions = [
        { description: 'Salário Mensal', amount: 8500, type: 'income', category: 'Receitas/Entradas', date: new Date().toISOString().split('T')[0] },
        { description: 'Aluguel Apartamento', amount: 2200, type: 'expense', category: 'Casa/Moradia', date: new Date().toISOString().split('T')[0] },
        { description: 'Supermercado Mensal', amount: 850.45, type: 'expense', category: 'Alimentação', date: new Date().toISOString().split('T')[0] },
        { description: 'Restaurante Fim de Semana', amount: 120.50, type: 'expense', category: 'Alimentação', date: new Date().toISOString().split('T')[0] },
        { description: 'Combustível', amount: 350.00, type: 'expense', category: 'Transporte', date: new Date().toISOString().split('T')[0] },
        { description: 'Academia', amount: 159.90, type: 'expense', category: 'Saúde', date: new Date().toISOString().split('T')[0] },
        { description: 'Venda OLX', amount: 250.00, type: 'income', category: 'Outros', date: new Date().toISOString().split('T')[0] },
        { description: 'Cinema e Lazer', amount: 80.00, type: 'expense', category: 'Lazer', date: new Date().toISOString().split('T')[0] },
    ];

    const mockBills = [
        { description: 'Conta de Energia', dueDay: 10, amount: 250, isAutoDebit: false, category: 'Casa/Moradia' },
        { description: 'Internet Fibra', dueDay: 15, amount: 99.90, isAutoDebit: true, category: 'Casa/Moradia' },
        { description: 'Plano de Saúde', dueDay: 5, amount: 450, isAutoDebit: true, category: 'Saúde' },
        { description: 'Condomínio', dueDay: 10, amount: 650, isAutoDebit: false, category: 'Casa/Moradia' },
    ];

    console.log('[SEED] Starting population for account:', accountId);

    try {
        // 1. Add Transactions
        console.log('[SEED] Inserting transactions...');
        for (const tx of mockTransactions) {
            await db.addTransaction(accountId, {
                ...tx,
                id: generateId(),
                payment_method: tx.type === 'income' ? 'PIX' : 'Débito'
            });
        }

        // 2. Add Bills
        console.log('[SEED] Inserting bills...');
        for (const bill of mockBills) {
            await db.addBill(accountId, {
                id: generateId(),
                description: bill.description,
                amount: bill.amount,
                category: bill.category,
                due_day: bill.dueDay,
                is_auto_debit: bill.isAutoDebit
            });
        }

        console.log('[SEED] Population completed successfully');
        return true;
    } catch (error) {
        console.error('[SEED] Critical failure:', error);
        throw error;
    }
};
