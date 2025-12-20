
import db from './db';
import { TransactionType, PaymentMethod, Transaction, Bill } from '@/types';

export const seedMockData = async (accountId: string) => {
    if (!accountId) throw new Error('Account ID is required');

    const generateId = () => Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);

    const mockTransactions: Omit<Transaction, 'id'>[] = [
        { description: 'Salário Mensal', amount: 8500, type: TransactionType.INCOME, category: 'Receitas/Entradas', subcategory: 'BP', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.PIX },
        { description: 'Aluguel Apartamento', amount: 2200, type: TransactionType.EXPENSE, category: 'Casa/Moradia', subcategory: 'Aluguel/Financiamento', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.OUTRO },
        { description: 'Supermercado Mensal', amount: 850.45, type: TransactionType.EXPENSE, category: 'Alimentação', subcategory: 'Supermercado', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.DEBITO },
        { description: 'Restaurante Fim de Semana', amount: 120.50, type: TransactionType.EXPENSE, category: 'Alimentação', subcategory: 'Refeições Fora', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.PIX },
        { description: 'Combustível', amount: 350.00, type: TransactionType.EXPENSE, category: 'Transporte', subcategory: 'Combustível/Manutenção', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.DEBITO },
        { description: 'Academia', amount: 159.90, type: TransactionType.EXPENSE, category: 'Saúde', subcategory: 'Academia', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.DEBITO },
        { description: 'Venda OLX', amount: 250.00, type: TransactionType.INCOME, category: 'Receitas/Entradas', subcategory: 'Outras Receitas', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.PIX },
        { description: 'Cinema e Lazer', amount: 80.00, type: TransactionType.EXPENSE, category: 'Lazer', subcategory: 'Entretenimento', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.DINHEIRO },
    ];

    const mockBills: Omit<Bill, 'id'>[] = [
        { description: 'Conta de Energia', dueDay: 10, amount: 250, isAutoDebit: false, category: 'Casa/Moradia', subcategory: 'Contas Domésticas' },
        { description: 'Internet Fibra', dueDay: 15, amount: 99.90, isAutoDebit: true, category: 'Casa/Moradia', subcategory: 'Contas Domésticas' },
        { description: 'Plano de Saúde', dueDay: 5, amount: 450, isAutoDebit: true, category: 'Saúde', subcategory: 'Planos/Seguros' },
        { description: 'Condomínio', dueDay: 10, amount: 650, isAutoDebit: false, category: 'Casa/Moradia', subcategory: 'Aluguel/Financiamento' },
    ];

    console.log('[SEED] Starting population (Web) for account:', accountId);

    try {
        // 1. Add Transactions
        const txsWithIds = mockTransactions.map(tx => ({ ...tx, id: generateId() }));
        await db.upsertTransactions(txsWithIds as any, accountId);

        // 2. Add Bills
        const billsWithIds = mockBills.map(bill => ({ ...bill, id: generateId() }));
        await db.upsertBills(billsWithIds as any, accountId);

        console.log('[SEED] Population completed successfully');
        return true;
    } catch (error) {
        console.error('[SEED] Critical failure:', error);
        throw error;
    }
};
