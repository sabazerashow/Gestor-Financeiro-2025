
import db from './db';
import { TransactionType, PaymentMethod, Transaction, Bill } from '@/types';

export const seedMockData = async (accountId: string) => {
    if (!accountId) throw new Error('Account ID is required');

    const generateId = () => Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);

    const mockTransactions: Transaction[] = [
        { id: 'seed-salary-1', description: 'Salário Mensal', amount: 8500, type: TransactionType.INCOME, category: 'Receitas/Entradas', subcategory: 'BP', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.PIX },
        { id: 'seed-rent-1', description: 'Aluguel Apartamento', amount: 2200, type: TransactionType.EXPENSE, category: 'Casa/Moradia', subcategory: 'Aluguel/Financiamento', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.OUTRO },
        { id: 'seed-market-1', description: 'Supermercado Mensal', amount: 850.45, type: TransactionType.EXPENSE, category: 'Alimentação', subcategory: 'Supermercado', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.DEBITO },
        { id: 'seed-restaurant-1', description: 'Restaurante Fim de Semana', amount: 120.50, type: TransactionType.EXPENSE, category: 'Alimentação', subcategory: 'Refeições Fora', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.PIX },
        { id: 'seed-fuel-1', description: 'Combustível', amount: 350.00, type: TransactionType.EXPENSE, category: 'Transporte', subcategory: 'Combustível/Manutenção', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.DEBITO },
        { id: 'seed-gym-1', description: 'Academia', amount: 159.90, type: TransactionType.EXPENSE, category: 'Saúde', subcategory: 'Academia', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.DEBITO },
        { id: 'seed-sale-1', description: 'Venda OLX', amount: 250.00, type: TransactionType.INCOME, category: 'Receitas/Entradas', subcategory: 'Outras Receitas', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.PIX },
        { id: 'seed-movie-1', description: 'Cinema e Lazer', amount: 80.00, type: TransactionType.EXPENSE, category: 'Lazer', subcategory: 'Entretenimento', date: new Date().toISOString().split('T')[0], paymentMethod: PaymentMethod.DINHEIRO },
    ];

    const mockBills: Bill[] = [
        { id: 'seed-bill-energy-1', description: 'Conta de Energia', dueDay: 10, amount: 250, isAutoDebit: false, category: 'Casa/Moradia', subcategory: 'Contas Domésticas' },
        { id: 'seed-bill-internet-1', description: 'Internet Fibra', dueDay: 15, amount: 99.90, isAutoDebit: true, category: 'Casa/Moradia', subcategory: 'Contas Domésticas' },
        { id: 'seed-bill-health-1', description: 'Plano de Saúde', dueDay: 5, amount: 450, isAutoDebit: true, category: 'Saúde', subcategory: 'Planos/Seguros' },
        { id: 'seed-bill-condo-1', description: 'Condomínio', dueDay: 10, amount: 650, isAutoDebit: false, category: 'Casa/Moradia', subcategory: 'Aluguel/Financiamento' },
    ];

    console.log('[SEED] Starting population (Web) for account:', accountId);

    try {
        // 1. Add Transactions
        await db.upsertTransactions(mockTransactions, accountId);

        // 2. Add Bills
        await db.upsertBills(mockBills, accountId);

        console.log('[SEED] Population completed successfully');
        return true;
    } catch (error) {
        console.error('[SEED] Critical failure:', error);
        throw error;
    }
};
