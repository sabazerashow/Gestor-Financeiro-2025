export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum Frequency {
  MONTHLY = 'monthly',
}

export enum PaymentMethod {
  PIX = 'PIX',
  DEBITO = 'Débito',
  CREDITO = 'Crédito',
  DINHEIRO = 'Dinheiro',
  OUTRO = 'Outro',
}

export const paymentMethodDetails: { [key in PaymentMethod]: { icon: string; color: string } } = {
  [PaymentMethod.PIX]: { icon: 'fa-brands fa-pix', color: 'text-cyan-500' },
  [PaymentMethod.DEBITO]: { icon: 'fa-solid fa-credit-card', color: 'text-blue-500' },
  [PaymentMethod.CREDITO]: { icon: 'fa-regular fa-credit-card', color: 'text-orange-500' },
  [PaymentMethod.DINHEIRO]: { icon: 'fa-solid fa-money-bill-wave', color: 'text-primary' },
  [PaymentMethod.OUTRO]: { icon: 'fa-solid fa-circle-question', color: 'text-gray-500' },
};


export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category?: string;
  subcategory?: string;
  isRecurring?: boolean;
  paymentMethod?: PaymentMethod;
  installmentDetails?: {
    purchaseId: string; // A unique ID for the entire purchase
    current: number;    // The current installment number (e.g., 1, 2, 3)
    total: number;      // The total number of installments (e.g., 6)
    totalAmount: number;// The total value of the original purchase
  };
  createdBy?: string;     // user_id from Supabase
  createdByName?: string; // name to display
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType.EXPENSE;
  category: string;
  subcategory: string;
  frequency: Frequency;
  startDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  linkedBillId?: string;
}

export interface Bill {
  id: string;
  description: string;
  dueDay: number; // 1-31
  isAutoDebit: boolean;
  amount?: number;
  category?: string;
  subcategory?: string;
  recurringTransactionId?: string;
}

export interface GroupedTransaction {
  category: string;
  totalAmount: number;
  items: string[];
  description: string;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface CategoryIncome {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface TransactionToReview {
  originalDescription: string;
  description: string;
  amount: number;
  category: string;
  subcategory: string;
  paymentMethod: PaymentMethod;
  date?: string;
}

export interface PayslipLineItem {
  description: string;
  value: number;
}

export interface Payslip {
  id: string;
  month: number;
  year: number;
  payments: PayslipLineItem[];
  deductions: PayslipLineItem[];
  netTotal: number;
  grossTotal: number;
  deductionsTotal: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'personal' | 'couple';
  created_at?: string;
  created_by?: string;
}

export interface AccountMember {
  id: string;
  account_id: string;
  user_id: string;
  role: 'owner' | 'member' | 'viewer';
  created_at?: string;
}
