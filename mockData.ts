import { Transaction, Payslip, Bill, RecurringTransaction, TransactionType, PaymentMethod, Frequency } from './types';

export const mockBills: Bill[] = [
    { id: 'bill1', description: 'Conta de Luz', dueDay: 7, isAutoDebit: false },
    { id: 'bill2', description: 'Internet', dueDay: 15, isAutoDebit: true, amount: 99.90, category: 'Casa/Moradia', subcategory: 'Contas Domésticas' },
    { id: 'bill3', description: 'Plano de Saúde', dueDay: 10, isAutoDebit: true, amount: 450.00, category: 'Saúde', subcategory: 'Consultas/Médicos', recurringTransactionId: 'rec-bill3' },
    { id: 'bill4', description: 'Seguro do Carro', dueDay: 20, isAutoDebit: true, amount: 180.50, category: 'Transporte', subcategory: 'Combustível/Manutenção', recurringTransactionId: 'rec-bill4' },
    { id: 'bill5', description: 'Fatura Cartão Nubank', dueDay: 25, isAutoDebit: false },
    { id: 'bill6', description: 'Condomínio', dueDay: 5, isAutoDebit: false },
];

export const mockRecurringTransactions: RecurringTransaction[] = [
    { id: 'rec1', description: 'Aluguel do Apartamento', amount: 1500, type: TransactionType.EXPENSE, category: 'Casa/Moradia', subcategory: 'Aluguel/Financiamento', frequency: Frequency.MONTHLY, startDate: '2024-01-05', nextDueDate: '2024-01-05' },
    { id: 'rec2', description: 'Assinatura de Streaming', amount: 55.90, type: TransactionType.EXPENSE, category: 'Lazer', subcategory: 'Entretenimento', frequency: Frequency.MONTHLY, startDate: '2024-01-12', nextDueDate: '2024-01-12' },
    { id: 'rec-bill3', linkedBillId: 'bill3', description: 'Plano de Saúde', amount: 450.00, type: TransactionType.EXPENSE, category: 'Saúde', subcategory: 'Consultas/Médicos', frequency: Frequency.MONTHLY, startDate: '2024-01-10', nextDueDate: '2024-01-10' },
    { id: 'rec-bill4', linkedBillId: 'bill4', description: 'Seguro do Carro', amount: 180.50, type: TransactionType.EXPENSE, category: 'Transporte', subcategory: 'Combustível/Manutenção', frequency: Frequency.MONTHLY, startDate: '2024-01-20', nextDueDate: '2024-01-20' },
];

export const mockPayslips: Payslip[] = [
  {
    "id": "payslip-2024-1",
    "month": 1,
    "year": 2024,
    "payments": [
      {
        "description": "SOLDO",
        "value": 11505.39
      },
      {
        "description": "AD MILITAR",
        "value": 2876.35
      },
      {
        "description": "AD COMP DISP",
        "value": 2301.08
      },
      {
        "description": "AD HABILIT",
        "value": 8398.93
      },
      {
        "description": "ACO VOO TM",
        "value": 2301.08
      }
    ],
    "deductions": [
      {
        "description": "PENSAO MILIT",
        "value": 2875.28
      },
      {
        "description": "FUSMA TIT",
        "value": 492.9
      },
      {
        "description": "FUSMA DEPDIR",
        "value": 82.15
      },
      {
        "description": "IMP RENDA",
        "value": 5608.2
      },
      {
        "description": "CN MENS",
        "value": 250.8
      },
      {
        "description": "PROMORAR",
        "value": 5300.63
      }
    ],
    "netTotal": 12773,
    "grossTotal": 27382.83,
    "deductionsTotal": 14609.96
  },
  {
    "id": "payslip-2024-2",
    "month": 2,
    "year": 2024,
    "payments": [
      {
        "description": "SOLDO",
        "value": 11520.26
      },
      {
        "description": "AD MILITAR",
        "value": 2880.07
      },
      {
        "description": "AD COMP DISP",
        "value": 2304.05
      },
      {
        "description": "AD HABILIT",
        "value": 8409.79
      },
      {
        "description": "ACO VOO TM",
        "value": 2304.05
      }
    ],
    "deductions": [
      {
        "description": "PENSAO MILIT",
        "value": 2878.97
      },
      {
        "description": "FUSMA TIT",
        "value": 493.54
      },
      {
        "description": "FUSMA DEPDIR",
        "value": 82.26
      },
      {
        "description": "IMP RENDA",
        "value": 5617.91
      },
      {
        "description": "CN MENS",
        "value": 250.8
      },
      {
        "description": "PROMORAR",
        "value": 5300.63
      }
    ],
    "netTotal": 12794.11,
    "grossTotal": 27418.22,
    "deductionsTotal": 14624.11
  },
  {
    "id": "payslip-2024-3",
    "month": 3,
    "year": 2024,
    "payments": [
      {
        "description": "SOLDO",
        "value": 11491.56
      },
      {
        "description": "AD MILITAR",
        "value": 2872.89
      },
      {
        "description": "AD COMP DISP",
        "value": 2298.31
      },
      {
        "description": "AD HABILIT",
        "value": 8388.84
      },
      {
        "description": "ACO VOO TM",
        "value": 2298.31
      }
    ],
    "deductions": [
      {
        "description": "PENSAO MILIT",
        "value": 2871.98
      },
      {
        "description": "FUSMA TIT",
        "value": 492.34
      },
      {
        "description": "FUSMA DEPDIR",
        "value": 82.06
      },
      {
        "description": "IMP RENDA",
        "value": 5599.07
      },
      {
        "description": "CN MENS",
        "value": 250.8
      },
      {
        "description": "PROMORAR",
        "value": 5300.63
      }
    ],
    "netTotal": 12753.03,
    "grossTotal": 27349.91,
    "deductionsTotal": 14596.88
  },
  {
    "id": "payslip-2024-4",
    "month": 4,
    "year": 2024,
    "payments": [
      {
        "description": "SOLDO",
        "value": 11624.16
      },
      {
        "description": "AD MILITAR",
        "value": 2906.04
      },
      {
        "description": "AD COMP DISP",
        "value": 2324.83
      },
      {
        "description": "AD HABILIT",
        "value": 8485.64
      },
      {
        "description": "ACO VOO TM",
        "value": 2324.83
      }
    ],
    "deductions": [
      {
        "description": "PENSAO MILIT",
        "value": 2904.99
      },
      {
        "description": "FUSMA TIT",
        "value": 497.99
      },
      {
        "description": "FUSMA DEPDIR",
        "value": 83
      },
      {
        "description": "IMP RENDA",
        "value": 5693.31
      },
      {
        "description": "CN MENS",
        "value": 250.8
      },
      {
        "description": "PROMORAR",
        "value": 5300.63
      }
    ],
    "netTotal": 12934.78,
    "grossTotal": 27665.5,
    "deductionsTotal": 14730.72
  },
  {
    "id": "payslip-2024-5",
    "month": 5,
    "year": 2024,
    "payments": [
      {
        "description": "SOLDO",
        "value": 11524.31
      },
      {
        "description": "AD MILITAR",
        "value": 2881.08
      },
      {
        "description": "AD COMP DISP",
        "value": 2304.86
      },
      {
        "description": "AD HABILIT",
        "value": 8412.75
      },
      {
        "description": "ACO VOO TM",
        "value": 2304.86
      }
    ],
    "deductions": [
      {
        "description": "PENSAO MILIT",
        "value": 2879.88
      },
      {
        "description": "FUSMA TIT",
        "value": 493.69
      },
      {
        "description": "FUSMA DEPDIR",
        "value": 82.28
      },
      {
        "description": "IMP RENDA",
        "value": 5621.19
      },
      {
        "description": "CN MENS",
        "value": 250.8
      },
      {
        "description": "PROMORAR",
        "value": 5300.63
      }
    ],
    "netTotal": 12799.39,
    "grossTotal": 27427.86,
    "deductionsTotal": 14628.47
  },
  {
    "id": "payslip-2024-6",
    "month": 6,
    "year": 2024,
    "payments": [
      {
        "description": "SOLDO",
        "value": 11516.29
      },
      {
        "description": "AD MILITAR",
        "value": 2879.07
      },
      {
        "description": "AD COMP DISP",
        "value": 2303.26
      },
      {
        "description": "AD HABILIT",
        "value": 8406.89
      },
      {
        "description": "ACO VOO TM",
        "value": 2303.26
      },
      {
        "description": "ADICIONAL NATAL",
        "value": 5758.15
      }
    ],
    "deductions": [
      {
        "description": "PENSAO MILIT",
        "value": 3482.56
      },
      {
        "description": "FUSMA TIT",
        "value": 596.14
      },
      {
        "description": "FUSMA DEPDIR",
        "value": 99.36
      },
      {
        "description": "IMP RENDA",
        "value": 7575.4
      },
      {
        "description": "CN MENS",
        "value": 250.8
      },
      {
        "description": "PROMORAR",
        "value": 5300.63
      }
    ],
    "netTotal": 15862.03,
    "grossTotal": 33166.92,
    "deductionsTotal": 17304.89
  },
  {
    "id": "payslip-2024-7",
    "month": 7,
    "year": 2024,
    "payments": [
      {
        "description": "SOLDO",
        "value": 11508.85
      },
      {
        "description": "AD MILITAR",
        "value": 2877.21
      },
      {
        "description": "AD COMP DISP",
        "value": 2301.77
      },
      {
        "description": "AD HABILIT",
        "value": 8401.46
      },
      {
        "description": "ACO VOO TM",
        "value": 2301.77
      }
    ],
    "deductions": [
      {
        "description": "PENSAO MILIT",
        "value": 2875.99
      },
      {
        "description": "FUSMA TIT",
        "value": 493.03
      },
      {
        "description": "FUSMA DEPDIR",
        "value": 82.17
      },
      {
        "description": "IMP RENDA",
        "value": 5610.15
      },
      {
        "description": "CN MENS",
        "value": 250.8
      },
      {
        "description": "PROMORAR",
        "value": 5300.63
      }
    ],
    "netTotal": 12778.29,
    "grossTotal": 27391.06,
    "deductionsTotal": 14612.77
  }
];

export const mockTransactions: Transaction[] = [
  {
    "id": "inc-2024-1",
    "description": "Salário janeiro 2024",
    "amount": 12773,
    "type": TransactionType.INCOME,
    "date": "2024-01-01",
    "category": "Receitas/Entradas",
    "subcategory": "BP",
    "paymentMethod": PaymentMethod.OUTRO
  },
  {
    "id": "inst-1721245318684-9343-1",
    "description": "Celular Novo (1/12)",
    "amount": 375,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-25",
    "category": "Despesas Pessoais",
    "subcategory": "Vestuário/Acessórios",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-9343",
      "current": 1,
      "total": 12,
      "totalAmount": 4500
    }
  },
  {
    "id": "exp-2024-1-sup-0",
    "description": "Compras Supermercado",
    "amount": 692.93,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-21",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-1-sup-1",
    "description": "Compras Supermercado",
    "amount": 541.34,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-14",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-1-rest-0",
    "description": "Restaurante/iFood",
    "amount": 84.14,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-15",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-1-rest-1",
    "description": "Restaurante/iFood",
    "amount": 124.97,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-05",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-1-rest-2",
    "description": "Restaurante/iFood",
    "amount": 108.99,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-05",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-1-rest-3",
    "description": "Restaurante/iFood",
    "amount": 91.07,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-02",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-1-rest-4",
    "description": "Restaurante/iFood",
    "amount": 149.61,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-16",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-1-rest-5",
    "description": "Restaurante/iFood",
    "amount": 139.38,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-12",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-1-rest-6",
    "description": "Restaurante/iFood",
    "amount": 103.85,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-03",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-1-transp-0",
    "description": "Combustível",
    "amount": 234.33,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-20",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-1-transp-1",
    "description": "Combustível",
    "amount": 221.09,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-07",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-1-transp-2",
    "description": "Combustível",
    "amount": 169.17,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-23",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-1-transp-3",
    "description": "Combustível",
    "amount": 154.21,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-05",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-1-rand-0",
    "description": "Compra Lazer",
    "amount": 135.53,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-01",
    "category": "Lazer",
    "subcategory": "Restaurantes Sociais",
    "paymentMethod": PaymentMethod.PIX
  },
  {
    "id": "exp-2024-1-rand-1",
    "description": "Compra Saúde",
    "amount": 298.59,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-20",
    "category": "Saúde",
    "subcategory": "Medicamentos/Farmácia",
    "paymentMethod": PaymentMethod.PIX
  },
  {
    "id": "exp-2024-1-rand-2",
    "description": "Compra Outros",
    "amount": 272.23,
    "type": TransactionType.EXPENSE,
    "date": "2024-01-13",
    "category": "Outros",
    "subcategory": "Vendidas/Recebidas",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "inc-2024-2",
    "description": "Salário fevereiro 2024",
    "amount": 12794.11,
    "type": TransactionType.INCOME,
    "date": "2024-02-01",
    "category": "Receitas/Entradas",
    "subcategory": "BP",
    "paymentMethod": PaymentMethod.OUTRO
  },
  {
    "id": "inst-1721245318684-9343-2",
    "description": "Celular Novo (2/12)",
    "amount": 375,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-25",
    "category": "Despesas Pessoais",
    "subcategory": "Vestuário/Acessórios",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-9343",
      "current": 2,
      "total": 12,
      "totalAmount": 4500
    }
  },
  {
    "id": "exp-2024-2-sup-0",
    "description": "Compras Supermercado",
    "amount": 560.18,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-09",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-2-sup-1",
    "description": "Compras Supermercado",
    "amount": 692.61,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-18",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-2-sup-2",
    "description": "Compras Supermercado",
    "amount": 651.91,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-10",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-2-sup-3",
    "description": "Compras Supermercado",
    "amount": 425.29,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-13",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-2-rest-0",
    "description": "Restaurante/iFood",
    "amount": 85.34,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-10",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-2-rest-1",
    "description": "Restaurante/iFood",
    "amount": 105.7,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-27",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-2-rest-2",
    "description": "Restaurante/iFood",
    "amount": 78.43,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-04",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-2-rest-3",
    "description": "Restaurante/iFood",
    "amount": 91.56,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-12",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-2-rest-4",
    "description": "Restaurante/iFood",
    "amount": 139.69,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-09",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-2-transp-0",
    "description": "Combustível",
    "amount": 194.52,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-25",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-2-transp-1",
    "description": "Combustível",
    "amount": 178.58,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-18",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-2-transp-2",
    "description": "Combustível",
    "amount": 234.35,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-22",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-2-transp-3",
    "description": "Combustível",
    "amount": 232.06,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-11",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-2-transp-4",
    "description": "Combustível",
    "amount": 198.81,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-13",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-2-rand-0",
    "description": "Compra Lazer",
    "amount": 182.25,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-20",
    "category": "Lazer",
    "subcategory": "Viagens/Férias",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-2-rand-1",
    "description": "Compra Casa/Moradia",
    "amount": 169.34,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-17",
    "category": "Casa/Moradia",
    "subcategory": "Manutenção/Móveis",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-2-rand-2",
    "description": "Compra Transporte",
    "amount": 230.13,
    "type": TransactionType.EXPENSE,
    "date": "2024-02-12",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "inc-2024-3",
    "description": "Salário março 2024",
    "amount": 12753.03,
    "type": TransactionType.INCOME,
    "date": "2024-03-01",
    "category": "Receitas/Entradas",
    "subcategory": "BP",
    "paymentMethod": PaymentMethod.OUTRO
  },
  {
    "id": "inst-1721245318684-9343-3",
    "description": "Celular Novo (3/12)",
    "amount": 375,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-25",
    "category": "Despesas Pessoais",
    "subcategory": "Vestuário/Acessórios",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-9343",
      "current": 3,
      "total": 12,
      "totalAmount": 4500
    }
  },
  {
    "id": "inst-1721245318684-5310-1",
    "description": "Viagem Pascoa (1/6)",
    "amount": 400,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-10",
    "category": "Lazer",
    "subcategory": "Viagens/Férias",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-5310",
      "current": 1,
      "total": 6,
      "totalAmount": 2400
    }
  },
  {
    "id": "exp-2024-3-sup-0",
    "description": "Compras Supermercado",
    "amount": 427.79,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-07",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-sup-1",
    "description": "Compras Supermercado",
    "amount": 772.37,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-02",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-rest-0",
    "description": "Restaurante/iFood",
    "amount": 105.77,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-05",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-rest-1",
    "description": "Restaurante/iFood",
    "amount": 149.23,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-16",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-rest-2",
    "description": "Restaurante/iFood",
    "amount": 54.08,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-24",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-rest-3",
    "description": "Restaurante/iFood",
    "amount": 63.82,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-27",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-rest-4",
    "description": "Restaurante/iFood",
    "amount": 110.15,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-05",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-rest-5",
    "description": "Restaurante/iFood",
    "amount": 61.34,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-09",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-rest-6",
    "description": "Restaurante/iFood",
    "amount": 141.6,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-23",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-rest-7",
    "description": "Restaurante/iFood",
    "amount": 92.29,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-24",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-rest-8",
    "description": "Restaurante/iFood",
    "amount": 74.07,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-17",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-transp-0",
    "description": "Combustível",
    "amount": 154.55,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-12",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-3-transp-1",
    "description": "Combustível",
    "amount": 182.02,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-14",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-3-transp-2",
    "description": "Combustível",
    "amount": 169.65,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-08",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-3-transp-3",
    "description": "Combustível",
    "amount": 175.76,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-23",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-3-transp-4",
    "description": "Combustível",
    "amount": 196.44,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-06",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-3-rand-0",
    "description": "Compra Lazer",
    "amount": 196.53,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-11",
    "category": "Lazer",
    "subcategory": "Restaurantes Sociais",
    "paymentMethod": PaymentMethod.PIX
  },
  {
    "id": "exp-2024-3-rand-1",
    "description": "Compra Lazer",
    "amount": 47.78,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-24",
    "category": "Lazer",
    "subcategory": "Viagens/Férias",
    "paymentMethod": PaymentMethod.PIX
  },
  {
    "id": "exp-2024-3-rand-2",
    "description": "Compra Saúde",
    "amount": 269.83,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-19",
    "category": "Saúde",
    "subcategory": "Medicamentos/Farmácia",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-3-rand-3",
    "description": "Compra Lazer",
    "amount": 235.61,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-09",
    "category": "Lazer",
    "subcategory": "Entretenimento",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-3-rand-4",
    "description": "Compra Saúde",
    "amount": 42.17,
    "type": TransactionType.EXPENSE,
    "date": "2024-03-20",
    "category": "Saúde",
    "subcategory": "Consultas/Médicos",
    "paymentMethod": PaymentMethod.PIX
  },
  {
    "id": "inc-2024-4",
    "description": "Salário abril 2024",
    "amount": 12934.78,
    "type": TransactionType.INCOME,
    "date": "2024-04-01",
    "category": "Receitas/Entradas",
    "subcategory": "BP",
    "paymentMethod": PaymentMethod.OUTRO
  },
  {
    "id": "inst-1721245318684-9343-4",
    "description": "Celular Novo (4/12)",
    "amount": 375,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-25",
    "category": "Despesas Pessoais",
    "subcategory": "Vestuário/Acessórios",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-9343",
      "current": 4,
      "total": 12,
      "totalAmount": 4500
    }
  },
  {
    "id": "inst-1721245318684-5310-2",
    "description": "Viagem Pascoa (2/6)",
    "amount": 400,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-10",
    "category": "Lazer",
    "subcategory": "Viagens/Férias",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-5310",
      "current": 2,
      "total": 6,
      "totalAmount": 2400
    }
  },
  {
    "id": "exp-2024-4-sup-0",
    "description": "Compras Supermercado",
    "amount": 414.73,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-10",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-4-sup-1",
    "description": "Compras Supermercado",
    "amount": 765.49,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-03",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-4-rest-0",
    "description": "Restaurante/iFood",
    "amount": 141.28,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-04",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-4-rest-1",
    "description": "Restaurante/iFood",
    "amount": 108.64,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-22",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-4-rest-2",
    "description": "Restaurante/iFood",
    "amount": 54.73,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-04",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-4-rest-3",
    "description": "Restaurante/iFood",
    "amount": 105.82,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-02",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-4-rest-4",
    "description": "Restaurante/iFood",
    "amount": 78.43,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-20",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-4-rest-5",
    "description": "Restaurante/iFood",
    "amount": 143.25,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-27",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-4-transp-0",
    "description": "Combustível",
    "amount": 178.69,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-06",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-4-transp-1",
    "description": "Combustível",
    "amount": 196.44,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-01",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-4-transp-2",
    "description": "Combustível",
    "amount": 242.44,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-12",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-4-transp-3",
    "description": "Combustível",
    "amount": 204.62,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-23",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-4-rand-0",
    "description": "Compra Saúde",
    "amount": 298.66,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-03",
    "category": "Saúde",
    "subcategory": "Academia/Esportes",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-4-rand-1",
    "description": "Compra Lazer",
    "amount": 223.1,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-21",
    "category": "Lazer",
    "subcategory": "Entretenimento",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-4-rand-2",
    "description": "Compra Outros",
    "amount": 236.4,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-25",
    "category": "Outros",
    "subcategory": "Presentes",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-4-rand-3",
    "description": "Compra Educação",
    "amount": 182.25,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-08",
    "category": "Educação",
    "subcategory": "Cursos/Livros",
    "paymentMethod": PaymentMethod.PIX
  },
  {
    "id": "exp-2024-4-rand-4",
    "description": "Compra Lazer",
    "amount": 107.01,
    "type": TransactionType.EXPENSE,
    "date": "2024-04-23",
    "category": "Lazer",
    "subcategory": "Entretenimento",
    "paymentMethod": PaymentMethod.PIX
  },
  {
    "id": "inc-2024-5",
    "description": "Salário maio 2024",
    "amount": 12799.39,
    "type": TransactionType.INCOME,
    "date": "2024-05-01",
    "category": "Receitas/Entradas",
    "subcategory": "BP",
    "paymentMethod": PaymentMethod.OUTRO
  },
  {
    "id": "inst-1721245318684-9343-5",
    "description": "Celular Novo (5/12)",
    "amount": 375,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-25",
    "category": "Despesas Pessoais",
    "subcategory": "Vestuário/Acessórios",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-9343",
      "current": 5,
      "total": 12,
      "totalAmount": 4500
    }
  },
  {
    "id": "inst-1721245318684-5310-3",
    "description": "Viagem Pascoa (3/6)",
    "amount": 400,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-10",
    "category": "Lazer",
    "subcategory": "Viagens/Férias",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-5310",
      "current": 3,
      "total": 6,
      "totalAmount": 2400
    }
  },
  {
    "id": "exp-2024-5-sup-0",
    "description": "Compras Supermercado",
    "amount": 546.61,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-16",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-5-sup-1",
    "description": "Compras Supermercado",
    "amount": 809.28,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-25",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-5-sup-2",
    "description": "Compras Supermercado",
    "amount": 844.75,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-26",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-5-sup-3",
    "description": "Compras Supermercado",
    "amount": 472.93,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-20",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-5-rest-0",
    "description": "Restaurante/iFood",
    "amount": 106.66,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-27",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-5-rest-1",
    "description": "Restaurante/iFood",
    "amount": 115.18,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-16",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-5-rest-2",
    "description": "Restaurante/iFood",
    "amount": 82.24,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-18",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-5-rest-3",
    "description": "Restaurante/iFood",
    "amount": 137.66,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-08",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-5-rest-4",
    "description": "Restaurante/iFood",
    "amount": 104.74,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-11",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-5-rest-5",
    "description": "Restaurante/iFood",
    "amount": 113.88,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-13",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-5-transp-0",
    "description": "Combustível",
    "amount": 242.02,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-24",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-5-transp-1",
    "description": "Combustível",
    "amount": 232.06,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-20",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-5-transp-2",
    "description": "Combustível",
    "amount": 182.26,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-11",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-5-rand-0",
    "description": "Compra Lazer",
    "amount": 185.08,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-18",
    "category": "Lazer",
    "subcategory": "Restaurantes Sociais",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-5-rand-1",
    "description": "Compra Lazer",
    "amount": 218.49,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-02",
    "category": "Lazer",
    "subcategory": "Entretenimento",
    "paymentMethod": PaymentMethod.PIX
  },
  {
    "id": "exp-2024-5-rand-2",
    "description": "Compra Outros",
    "amount": 204.62,
    "type": TransactionType.EXPENSE,
    "date": "2024-05-17",
    "category": "Outros",
    "subcategory": "Presentes",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "inc-2024-6",
    "description": "Salário junho 2024",
    "amount": 15862.03,
    "type": TransactionType.INCOME,
    "date": "2024-06-01",
    "category": "Receitas/Entradas",
    "subcategory": "BP",
    "paymentMethod": PaymentMethod.OUTRO
  },
  {
    "id": "inst-1721245318684-9343-6",
    "description": "Celular Novo (6/12)",
    "amount": 375,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-25",
    "category": "Despesas Pessoais",
    "subcategory": "Vestuário/Acessórios",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-9343",
      "current": 6,
      "total": 12,
      "totalAmount": 4500
    }
  },
  {
    "id": "inst-1721245318684-5310-4",
    "description": "Viagem Pascoa (4/6)",
    "amount": 400,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-10",
    "category": "Lazer",
    "subcategory": "Viagens/Férias",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-5310",
      "current": 4,
      "total": 6,
      "totalAmount": 2400
    }
  },
  {
    "id": "inst-1721245318684-1888-1",
    "description": "TV Nova (1/8)",
    "amount": 400,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-05",
    "category": "Casa/Moradia",
    "subcategory": "Compras para o Lar",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-1888",
      "current": 1,
      "total": 8,
      "totalAmount": 3200
    }
  },
  {
    "id": "exp-2024-6-sup-0",
    "description": "Compras Supermercado",
    "amount": 830.45,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-21",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-sup-1",
    "description": "Compras Supermercado",
    "amount": 546.06,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-06",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-sup-2",
    "description": "Compras Supermercado",
    "amount": 401.59,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-11",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-rest-0",
    "description": "Restaurante/iFood",
    "amount": 105.81,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-25",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-rest-1",
    "description": "Restaurante/iFood",
    "amount": 106.77,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-27",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-rest-2",
    "description": "Restaurante/iFood",
    "amount": 57.06,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-15",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-rest-3",
    "description": "Restaurante/iFood",
    "amount": 53.05,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-20",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-rest-4",
    "description": "Restaurante/iFood",
    "amount": 125.75,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-05",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-rest-5",
    "description": "Restaurante/iFood",
    "amount": 139.73,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-19",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-rest-6",
    "description": "Restaurante/iFood",
    "amount": 113.88,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-03",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-rest-7",
    "description": "Restaurante/iFood",
    "amount": 118.81,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-16",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-transp-0",
    "description": "Combustível",
    "amount": 234.33,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-07",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-6-transp-1",
    "description": "Combustível",
    "amount": 226.75,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-23",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-6-transp-2",
    "description": "Combustível",
    "amount": 232.06,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-12",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-6-rand-0",
    "description": "Compra Lazer",
    "amount": 169.17,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-24",
    "category": "Lazer",
    "subcategory": "Viagens/Férias",
    "paymentMethod": PaymentMethod.PIX
  },
  {
    "id": "exp-2024-6-rand-1",
    "description": "Compra Saúde",
    "amount": 128.52,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-19",
    "category": "Saúde",
    "subcategory": "Academia/Esportes",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-rand-2",
    "description": "Compra Lazer",
    "amount": 204.62,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-10",
    "category": "Lazer",
    "subcategory": "Restaurantes Sociais",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-6-rand-3",
    "description": "Compra Saúde",
    "amount": 139.73,
    "type": TransactionType.EXPENSE,
    "date": "2024-06-27",
    "category": "Saúde",
    "subcategory": "Medicamentos/Farmácia",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "inc-2024-7",
    "description": "Salário julho 2024",
    "amount": 12778.29,
    "type": TransactionType.INCOME,
    "date": "2024-07-01",
    "category": "Receitas/Entradas",
    "subcategory": "BP",
    "paymentMethod": PaymentMethod.OUTRO
  },
  {
    "id": "inst-1721245318684-9343-7",
    "description": "Celular Novo (7/12)",
    "amount": 375,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-25",
    "category": "Despesas Pessoais",
    "subcategory": "Vestuário/Acessórios",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-9343",
      "current": 7,
      "total": 12,
      "totalAmount": 4500
    }
  },
  {
    "id": "inst-1721245318684-5310-5",
    "description": "Viagem Pascoa (5/6)",
    "amount": 400,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-10",
    "category": "Lazer",
    "subcategory": "Viagens/Férias",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-5310",
      "current": 5,
      "total": 6,
      "totalAmount": 2400
    }
  },
  {
    "id": "inst-1721245318684-1888-2",
    "description": "TV Nova (2/8)",
    "amount": 400,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-05",
    "category": "Casa/Moradia",
    "subcategory": "Compras para o Lar",
    "paymentMethod": PaymentMethod.CREDITO,
    "installmentDetails": {
      "purchaseId": "inst-1721245318684-1888",
      "current": 2,
      "total": 8,
      "totalAmount": 3200
    }
  },
  {
    "id": "exp-2024-7-sup-0",
    "description": "Compras Supermercado",
    "amount": 418.1,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-10",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-7-sup-1",
    "description": "Compras Supermercado",
    "amount": 541.34,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-01",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-7-sup-2",
    "description": "Compras Supermercado",
    "amount": 765.49,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-06",
    "category": "Alimentação",
    "subcategory": "Supermercado/Compras",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-rest-0",
    "description": "Restaurante/iFood",
    "amount": 105.7,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-09",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-rest-1",
    "description": "Restaurante/iFood",
    "amount": 137.66,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-01",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-rest-2",
    "description": "Restaurante/iFood",
    "amount": 149.61,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-01",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-rest-3",
    "description": "Restaurante/iFood",
    "amount": 93.63,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-08",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-rest-4",
    "description": "Restaurante/iFood",
    "amount": 62.14,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-05",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-rest-5",
    "description": "Restaurante/iFood",
    "amount": 105.81,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-16",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-rest-6",
    "description": "Restaurante/iFood",
    "amount": 71.95,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-10",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-rest-7",
    "description": "Restaurante/iFood",
    "amount": 124.97,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-10",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-rest-8",
    "description": "Restaurante/iFood",
    "amount": 105.77,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-07",
    "category": "Alimentação",
    "subcategory": "Delivery/Apps",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-transp-0",
    "description": "Combustível",
    "amount": 169.17,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-12",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-7-transp-1",
    "description": "Combustível",
    "amount": 221.09,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-09",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-7-transp-2",
    "description": "Combustível",
    "amount": 182.26,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-01",
    "category": "Transporte",
    "subcategory": "Combustível/Manutenção",
    "paymentMethod": PaymentMethod.DEBITO
  },
  {
    "id": "exp-2024-7-rand-0",
    "description": "Compra Lazer",
    "amount": 158.48,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-13",
    "category": "Lazer",
    "subcategory": "Restaurantes Sociais",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-rand-1",
    "description": "Compra Outros",
    "amount": 235.61,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-13",
    "category": "Outros",
    "subcategory": "Presentes",
    "paymentMethod": PaymentMethod.CREDITO
  },
  {
    "id": "exp-2024-7-rand-2",
    "description": "Compra Outros",
    "amount": 223.1,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-04",
    "category": "Outros",
    "subcategory": "Doações/Caridade",
    "paymentMethod": PaymentMethod.PIX
  },
  {
    "id": "exp-2024-7-rand-3",
    "description": "Compra Casa/Moradia",
    "amount": 139.73,
    "type": TransactionType.EXPENSE,
    "date": "2024-07-04",
    "category": "Casa/Moradia",
    "subcategory": "Compras para o Lar",
    "paymentMethod": PaymentMethod.DEBITO
  }
];