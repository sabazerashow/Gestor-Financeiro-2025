export type CategoryInfo = {
  icon: string;
  color: string;
  subcategories: string[];
  type: 'income' | 'expense';
};

export const categories: { [key: string]: CategoryInfo } = {
  // Expense categories
  'Alimentação': { icon: 'fa-utensils', color: 'bg-blue-500', type: 'expense', subcategories: ['Supermercado/Compras', 'Refeições Fora', 'Delivery/Apps'] },
  'Casa/Moradia': { icon: 'fa-home', color: 'bg-green-500', type: 'expense', subcategories: ['Aluguel/Financiamento', 'Contas Domésticas', 'Manutenção/Móveis', 'Compras para o Lar'] },
  'Despesas Pessoais': { icon: 'fa-tshirt', color: 'bg-pink-500', type: 'expense', subcategories: ['Vestuário/Acessórios', 'Cuidados Pessoais', 'Assinaturas Pessoais'] },
  'Educação': { icon: 'fa-graduation-cap', color: 'bg-indigo-500', type: 'expense', subcategories: ['Cursos/Livros', 'Material Escolar', 'Idiomas/Técnicos'] },
  'Lazer': { icon: 'fa-film', color: 'bg-purple-500', type: 'expense', subcategories: ['Entretenimento', 'Viagens/Férias', 'Restaurantes Sociais'] },
  'Saúde': { icon: 'fa-heartbeat', color: 'bg-red-500', type: 'expense', subcategories: ['Consultas/Médicos', 'Medicamentos/Farmácia', 'Academia/Esportes'] },
  'Tarifas e Impostos': { icon: 'fa-file-invoice-dollar', color: 'bg-gray-500', type: 'expense', subcategories: ['Impostos', 'Taxas Bancárias/Tarifas', 'Multas/Juros'] },
  'Transporte': { icon: 'fa-car', color: 'bg-yellow-500', type: 'expense', subcategories: ['Combustível/Manutenção', 'Transporte Público/Uber', 'Viagens Aéreas'] },
  'Outros': { icon: 'fa-ellipsis-h', color: 'bg-stone-500', type: 'expense', subcategories: ['Doações/Caridade', 'Presentes', 'Vendidas/Recebidas'] },

  // Income categories
  'Receitas/Entradas': { icon: 'fa-money-bill-wave', color: 'bg-emerald-500', type: 'income', subcategories: ['BP', 'Outras Receitas'] }
};

export const expenseCategoryList = Object.entries(categories)
  .filter(([, info]) => info.type === 'expense')
  .map(([name]) => name);

export const incomeCategoryList = Object.entries(categories)
  .filter(([, info]) => info.type === 'income')
  .map(([name]) => name);
