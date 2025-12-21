import { db } from './db';

export const seedMockData = async (accountId) => {
    if (!accountId) throw new Error('Account ID is required');

    const today = new Date().toISOString().split('T')[0];

    const mockTransactions = [
        { id: 'seed-salary-1', description: 'Salário Mensal', amount: 8500, type: 'income', category: 'Receitas/Entradas', subcategory: 'BP', date: today, payment_method: 'PIX' },
        { id: 'seed-rent-1', description: 'Aluguel Apartamento', amount: 2200, type: 'expense', category: 'Casa/Moradia', subcategory: 'Aluguel/Financiamento', date: today, payment_method: 'Outro' },
        { id: 'seed-market-1', description: 'Supermercado Mensal', amount: 850.45, type: 'expense', category: 'Alimentação', subcategory: 'Supermercado', date: today, payment_method: 'Débito' },
        { id: 'seed-restaurant-1', description: 'Restaurante Fim de Semana', amount: 120.50, type: 'expense', category: 'Alimentação', subcategory: 'Refeições Fora', date: today, payment_method: 'PIX' },
        { id: 'seed-fuel-1', description: 'Combustível', amount: 350.00, type: 'expense', category: 'Transporte', subcategory: 'Combustível/Manutenção', date: today, payment_method: 'Débito' },
        { id: 'seed-gym-1', description: 'Academia', amount: 159.90, type: 'expense', category: 'Saúde', subcategory: 'Academia', date: today, payment_method: 'Débito' },
        { id: 'seed-sale-1', description: 'Venda OLX', amount: 250.00, type: 'income', category: 'Receitas/Entradas', subcategory: 'Outras Receitas', date: today, payment_method: 'PIX' },
        { id: 'seed-movie-1', description: 'Cinema e Lazer', amount: 80.00, type: 'expense', category: 'Lazer', subcategory: 'Entretenimento', date: today, payment_method: 'Dinheiro' },
    ];

    const mockBills = [
        { id: 'seed-bill-energy-1', description: 'Conta de Energia', due_day: 10, amount: 250, is_auto_debit: false, category: 'Casa/Moradia', subcategory: 'Contas Domésticas' },
        { id: 'seed-bill-internet-1', description: 'Internet Fibra', due_day: 15, amount: 99.90, is_auto_debit: true, category: 'Casa/Moradia', subcategory: 'Contas Domésticas' },
        { id: 'seed-bill-health-1', description: 'Plano de Saúde', due_day: 5, amount: 450, is_auto_debit: true, category: 'Saúde', subcategory: 'Planos/Seguros' },
        { id: 'seed-bill-condo-1', description: 'Condomínio', due_day: 10, amount: 650, is_auto_debit: false, category: 'Casa/Moradia', subcategory: 'Aluguel/Financiamento' },
    ];

    console.log('[SEED] Starting population (Mobile) for account:', accountId);

    try {
        // 1. Upsert Transactions
        console.log('[SEED] Upserting transactions...');
        await db.upsertTransactions(accountId, mockTransactions);

        // 2. Upsert Bills
        console.log('[SEED] Upserting bills...');
        await db.upsertBills(accountId, mockBills);

        console.log('[SEED] Population completed successfully');
        return true;
    } catch (error) {
        console.error('[SEED] Critical failure:', error);
        throw error;
    }
};
