
export const TransactionType = {
    INCOME: 'income',
    EXPENSE: 'expense',
};

export const PaymentMethod = {
    PIX: 'PIX',
    DEBITO: 'Débito',
    CREDITO: 'Crédito',
    DINHEIRO: 'Dinheiro',
    OUTRO: 'Outro',
};

export const paymentMethodDetails = {
    [PaymentMethod.PIX]: { icon: 'zap', color: '#00bcd4' },
    [PaymentMethod.DEBITO]: { icon: 'credit-card', color: '#2196f3' },
    [PaymentMethod.CREDITO]: { icon: 'credit-card', color: '#ff9800' },
    [PaymentMethod.DINHEIRO]: { icon: 'banknote', color: '#4caf50' },
    [PaymentMethod.OUTRO]: { icon: 'help-circle', color: '#9e9e9e' },
};

export const categories = {
    // Expense categories
    'A verificar': { icon: 'alert-circle', color: '#9e9e9e', type: 'expense', subcategories: ['A classificar'] },
    'Alimentação': { icon: 'utensils', color: '#2196f3', type: 'expense', subcategories: ['Supermercado/Compras', 'Refeições Fora', 'Delivery/Apps'] },
    'Casa/Moradia': { icon: 'home', color: '#4caf50', type: 'expense', subcategories: ['Aluguel/Financiamento', 'Contas Domésticas', 'Manutenção/Móveis', 'Compras para o Lar'] },
    'Despesas Pessoais': { icon: 'shirt', color: '#e91e63', type: 'expense', subcategories: ['Vestuário/Acessórios', 'Cuidados Pessoais', 'Assinaturas Pessoais'] },
    'Educação': { icon: 'graduation-cap', color: '#3f51b5', type: 'expense', subcategories: ['Cursos/Livros', 'Material Escolar', 'Idiomas/Técnicos'] },
    'Lazer': { icon: 'film', color: '#9c27b0', type: 'expense', subcategories: ['Entretenimento', 'Viagens/Férias', 'Restaurantes Sociais'] },
    'Saúde': { icon: 'heart', color: '#f44336', type: 'expense', subcategories: ['Consultas/Médicos', 'Medicamentos/Farmácia', 'Academia/Esportes'] },
    'Tarifas e Impostos': { icon: 'file-text', color: '#607d8b', type: 'expense', subcategories: ['Impostos', 'Taxas Bancárias/Tarifas', 'Multas/Juros'] },
    'Transporte': { icon: 'car', color: '#ffeb3b', type: 'expense', subcategories: ['Combustível/Manutenção', 'Transporte Público/Uber', 'Viagens Aéreas'] },
    'Outros': { icon: 'more-horizontal', color: '#795548', type: 'expense', subcategories: ['Doações/Caridade', 'Presentes', 'Vendidas/Recebidas'] },

    // Income categories
    'Receitas/Entradas': { icon: 'trending-up', color: '#10b981', type: 'income', subcategories: ['BP', 'Outras Receitas'] }
};

export const expenseCategoryList = Object.entries(categories)
    .filter(([, info]) => info.type === 'expense')
    .map(([name]) => name);

export const incomeCategoryList = Object.entries(categories)
    .filter(([, info]) => info.type === 'income')
    .map(([name]) => name);
