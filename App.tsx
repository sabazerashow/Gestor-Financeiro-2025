

import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, RecurringTransaction, Frequency, Bill, Payslip, PaymentMethod } from './types';
import Header from './components/Header';
import ErrorBanner from './components/ui/error-banner';
import Summary from './components/Summary';
import TransactionList from './components/TransactionList';
import AddTransactionForm from './components/AddTransactionForm';
import ImportNFeModal from './components/ImportNFeModal';
import ImportStatementModal from './components/ImportStatementModal';
import { categories } from './categories';
import QuickAddModal from './components/QuickAddModal';
import UpcomingPayments from './components/UpcomingPayments';
import BillList from './components/BillList';
import AddBillForm from './components/AddBillForm';
import EditTransactionModal from './components/EditTransactionModal';
import ImportBPModal from './components/ImportBPModal';
import ManualBPModal from './components/ManualBPModal';
import BPAnalysisView from './components/BPAnalysisView';
import DeleteInstallmentModal from './components/DeleteInstallmentModal';
import ConfirmDialog from './components/ConfirmDialog';
import ReportsView from './components/ReportsView';
import SpendingByCategoryCard from './components/report-cards/SpendingByCategoryCard';
import PendingInstallmentsCard from './components/report-cards/PendingInstallmentsCard';
import PeriodSummaryCard from './components/PeriodSummaryCard';
import FinancialInsights from './components/FinancialInsights';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import IncomeBreakdown from './components/IncomeBreakdown';
import PayBillChoiceModal from './components/PayBillChoiceModal';
import ProfileModal from './components/ProfileModal';
import InviteModal from './components/InviteModal';
// Removidos: ExportModal e ImportTransactionsModal (lançamentos manuais)
import { generateContent } from '@/lib/aiClient';
import AuthGate from './components/AuthGate';
import supabase, { isSupabaseEnabled, isAuthActive, isAuthDisabled } from '@/lib/supabase';
import db, { getSession, signOut, ensureDefaultAccount, purgeAccountData } from '@/lib/db';


// Define the shape of a dashboard card configuration
export interface DashboardCardConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: React.FC<any>; // The component to render
}

const defaultProfile = {
    name: 'Diego Sabá',
    title: 'Capitão de Corveta',
    email: 'diego.saba@email.com',
    dob: '1986-08-25',
    gender: 'Masculino',
    photo: 'https://i.ibb.co/6n20d5w/placeholder-profile.png'
};

// CSV export/import removidos: funcionalidades migradas para lançamentos manuais.

 const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [accountId, setAccountId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('accountId');
    } catch { return null; }
  });
  const [accountName, setAccountName] = useState<string | null>(() => {
    try {
      return localStorage.getItem('accountName');
    } catch { return null; }
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions);
        if (Array.isArray(parsed)) { 
          return parsed.map((t: any) => ({...t, amount: Number(t.amount) || 0}));
        }
      } catch (e) {
        console.error("Failed to parse transactions from localStorage", e);
      }
    }
    return [];
  });

  const [payslips, setPayslips] = useState<Payslip[]>(() => {
    const saved = localStorage.getItem('payslips');
    if (saved) {
        try {
            const parsedPayslips = JSON.parse(saved);
            if (Array.isArray(parsedPayslips)) {
                return parsedPayslips.map((p: any) => ({
                    ...p,
                    month: Number(p.month),
                    year: Number(p.year),
                    netTotal: Number(p.netTotal),
                    grossTotal: Number(p.grossTotal),
                    deductionsTotal: Number(p.deductionsTotal),
                    payments: p.payments?.map((item: any) => ({...item, value: Number(item.value)})) ?? [],
                    deductions: p.deductions?.map((item: any) => ({...item, value: Number(item.value)})) ?? [],
                }));
            }
        } catch (e) {
            console.error("Failed to parse payslips from localStorage", e);
        }
    }
    return [];
  });

  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(() => {
    const saved = localStorage.getItem('recurringTransactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
            return parsed.map((t: any) => ({...t, amount: Number(t.amount) || 0}));
        }
      } catch (e) {
        console.error("Failed to parse recurring transactions from localStorage", e);
      }
    }
    return [];
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('bills');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
            return parsed;
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Seed desativado: zerar dados locais caso estejam vazios
  useEffect(() => {
    if (isSupabaseEnabled) return;
    const hasTransactions = transactions && transactions.length > 0;
    const hasPayslips = payslips && payslips.length > 0;
    const hasRecurring = recurringTransactions && recurringTransactions.length > 0;
    const hasBills = bills && bills.length > 0;

    if (!hasTransactions) {
      setTransactions([]);
      try { localStorage.removeItem('transactions'); } catch { /* ignore */ }
    }

    if (!hasPayslips) {
      setPayslips([]);
      try { localStorage.removeItem('payslips'); } catch { /* ignore */ }
    }

    if (!hasRecurring) {
      setRecurringTransactions([]);
      try { localStorage.removeItem('recurringTransactions'); } catch { /* ignore */ }
    }

    if (!hasBills) {
      setBills([]);
      try { localStorage.removeItem('bills'); } catch { /* ignore */ }
    }
  }, []);

  // One-shot de-duplication for transactions persisted from previous dev sessions
  useEffect(() => {
    if (!transactions || transactions.length === 0) return;
    const seen = new Set<string>();
    const unique = transactions.filter(t => {
      const key = t.id || `${t.description}-${t.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (unique.length !== transactions.length) {
      setTransactions(unique);
      try { localStorage.setItem('transactions', JSON.stringify(unique)); } catch(e) { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Supabase Auth: obter sessão e escutar mudanças (apenas quando auth está ativa)
  useEffect(() => {
    if (!isAuthActive) return;
    let mounted = true;
    (async () => {
      const s = await getSession();
      if (mounted) setSession(s);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
    });
    return () => { mounted = false; sub?.subscription?.unsubscribe(); };
  }, []);

  // Após autenticar, garantir accountId (workspace) e armazenar (apenas quando auth está ativa)
  useEffect(() => {
    if (!isAuthActive || !session?.user?.id) return;
    let mounted = true;
    (async () => {
      try {
        const { accountId: accId, name } = await ensureDefaultAccount(session.user.id);
        if (!mounted) return;
        setAccountId(accId);
        setAccountName(name || null);
        try { localStorage.setItem('accountId', accId); } catch {/* ignore */}
        try { if (name) localStorage.setItem('accountName', name); } catch {/* ignore */}
      } catch (e) {
        console.error('Falha ao garantir conta padrão', e);
      }
    })();
    return () => { mounted = false; };
  }, [session]);

  // Ao autenticar, buscar dados do Supabase e preencher estados (apenas quando auth está ativa)
  useEffect(() => {
    if (!isAuthActive || !session || !accountId) return;
    (async () => {
      try {
        const [tx, rec, bl, ps] = await Promise.all([
          db.fetchTransactions(accountId),
          db.fetchRecurring(accountId),
          db.fetchBills(accountId),
          db.fetchPayslips(accountId),
        ]);
        if (tx && tx.length >= 0) setTransactions(tx as any);
        if (rec && rec.length >= 0) setRecurringTransactions(rec as any);
        if (bl && bl.length >= 0) setBills(bl as any);
        if (ps && ps.length >= 0) setPayslips(ps as any);
      } catch (e) {
        console.error('Falha ao buscar dados do Supabase', e);
      }
    })();
    // não depende dos estados locais para evitar loops iniciais
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, accountId]);

  // Sincronizar alterações locais com Supabase (apenas quando auth está ativa)
  useEffect(() => {
    if (!isAuthActive || !session || !accountId) return;
    (async () => {
      try {
        await db.upsertTransactions(transactions as any, accountId);
        await db.upsertRecurring(recurringTransactions as any, accountId);
        await db.upsertBills(bills as any, accountId);
        await db.upsertPayslips(payslips as any, accountId);
      } catch (e) {
        console.error('Falha ao sincronizar dados com Supabase', e);
      }
    })();
  }, [transactions, recurringTransactions, bills, payslips, session, accountId]);
  
  const allDashboardCards: DashboardCardConfig[] = useMemo(() => [
     {
      id: 'financialInsights',
      title: 'Análise Inteligente',
      description: 'Receba insights gerados por IA sobre seus padrões de gastos.',
      icon: 'fa-lightbulb',
      component: FinancialInsights,
    },
    {
      id: 'periodSummary',
      title: 'Resumo do Período',
      description: 'Visão consolidada de receitas, despesas e principais métricas.',
      icon: 'fa-balance-scale',
      component: PeriodSummaryCard,
    },
    {
      id: 'expenseBreakdown',
      title: 'Despesas por Categoria',
      description: 'Acompanhe a distribuição dos seus gastos no período selecionado.',
      icon: 'fa-chart-pie',
      component: ExpenseBreakdown,
    },
    {
        id: 'incomeBreakdown',
        title: 'Receitas por Categoria',
        description: 'Visualize a origem de suas receitas no período selecionado.',
        icon: 'fa-chart-bar',
        component: IncomeBreakdown,
    },
    {
        id: 'creditCardSpending',
        title: 'Gastos com Crédito',
        description: 'Análise detalhada dos seus gastos no cartão de crédito.',
        icon: 'fa-regular fa-credit-card',
        component: SpendingByCategoryCard,
    },
    {
        id: 'otherSpending',
        title: 'Gastos com Débito e Outros',
        description: 'Análise de gastos com Débito, PIX, Dinheiro, etc.',
        icon: 'fa-money-bill-wave',
        component: SpendingByCategoryCard,
    },
    {
        id: 'pendingInstallments',
        title: 'Parcelas Pendentes',
        description: 'Visualize o valor total e o status de suas compras parceladas.',
        icon: 'fa-calendar-alt',
        component: PendingInstallmentsCard,
    }
  ], []);


  const [cardVisibility, setCardVisibility] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('dashboardCardVisibility');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch(e) { /* fall through */ }
    }
    // Default visibility
    return {
        financialInsights: true,
        periodSummary: true,
        expenseBreakdown: true,
        incomeBreakdown: true,
        creditCardSpending: true,
        otherSpending: true,
        pendingInstallments: true,
    };
  });
  
    const [cardOrder, setCardOrder] = useState<string[]>(() => {
        const savedOrder = localStorage.getItem('dashboardCardOrder');
        if (savedOrder) {
            try {
                const parsed = JSON.parse(savedOrder) as string[];
                // Validate that the saved order contains exactly the same cards as the master list
                const allCardIds = new Set(allDashboardCards.map(c => c.id));
                const savedCardIds = new Set(parsed);
                if (allCardIds.size === savedCardIds.size && [...allCardIds].every(id => savedCardIds.has(id))) {
                    return parsed;
                }
            } catch (e) {
                console.error("Failed to parse card order from localStorage", e);
            }
        }
        // Default order
        return allDashboardCards.map(card => card.id);
    });

    const sortedDashboardCards = useMemo(() => {
        return [...allDashboardCards].sort((a, b) => {
            return cardOrder.indexOf(a.id) - cardOrder.indexOf(b.id);
        });
    }, [allDashboardCards, cardOrder]);

  const [activeTab, setActiveTab] = useState('overview');
  const [isNFeModalOpen, setIsNFeModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isBPModalOpen, setIsBPModalOpen] = useState(false);
  const [bpImportMode, setBpImportMode] = useState<'ocr' | 'ai'>('ocr');
  const [isManualBPModalOpen, setIsManualBPModalOpen] = useState(false);
  const [fileContent, setFileContent] = useState<{ content: string; mimeType: string } | null>(null);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [quickAddInitialDescription, setQuickAddInitialDescription] = useState<string | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteInstallmentModalOpen, setIsDeleteInstallmentModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [confirmDeleteContext, setConfirmDeleteContext] = useState<{
    kind: 'transaction' | 'bill';
    transaction?: Transaction;
    billId?: string;
  } | null>(null);
  const [installmentFilter, setInstallmentFilter] = useState<'all' | 'single' | 'installments'>('all');
  const [monthFilter, setMonthFilter] = useState<'all' | string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [isPayBillChoiceModalOpen, setIsPayBillChoiceModalOpen] = useState(false);
  const [billToPayDescription, setBillToPayDescription] = useState<string | undefined>(undefined);
  const [quickAddMode, setQuickAddMode] = useState<'ai' | 'manual'>('ai');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPurgeAllOpen, setIsPurgeAllOpen] = useState(false);
  // Estados de Exportação/Importação CSV removidos

  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        try {
            return JSON.parse(savedProfile);
        } catch (e) { /* fall through */ }
    }
    return defaultProfile;
  });
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
        return savedTheme;
    }
    return 'auto';
  });

  useEffect(() => {
    const applyTheme = () => {
        if (theme === 'auto') {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } else if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    localStorage.setItem('theme', theme);
    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === 'auto') {
            applyTheme();
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem('payslips', JSON.stringify(payslips));
  }, [payslips]);

  useEffect(() => {
    localStorage.setItem('recurringTransactions', JSON.stringify(recurringTransactions));
  }, [recurringTransactions]);

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);
  
  useEffect(() => {
    localStorage.setItem('dashboardCardVisibility', JSON.stringify(cardVisibility));
  }, [cardVisibility]);

  useEffect(() => {
    localStorage.setItem('dashboardCardOrder', JSON.stringify(cardOrder));
  }, [cardOrder]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

    // Data migration hook
  useEffect(() => {
    const migrationVersion = localStorage.getItem('migrationVersion');
    if (migrationVersion !== '2') {
      console.log("Running migration to version 2: Hierarchical Categories");

      const categoryMigrationMap: { [key: string]: [string, string] } = {
        'Alimentação': ['Alimentação', 'Refeições Fora'],
        'Moradia': ['Casa/Moradia', 'Aluguel/Financiamento'],
        'Transporte': ['Transporte', 'Combustível/Manutenção'],
        'Lazer': ['Lazer', 'Entretenimento'],
        'Saúde': ['Saúde', 'Consultas/Médicos'],
        'Educação': ['Educação', 'Cursos/Livros'],
        'Vestuário': ['Despesas Pessoais', 'Vestuário/Acessórios'],
        'Contas': ['Casa/Moradia', 'Contas Domésticas'],
        'Salário': ['Receitas/Entradas', 'BP'],
        'Vendas': ['Receitas/Entradas', 'Outras Receitas'],
        'Outros': ['Outros', 'Presentes'],
      };

      const migrateItem = (item: any) => {
        if (item.category && !item.subcategory && categoryMigrationMap[item.category]) {
          const [newCategory, newSubcategory] = categoryMigrationMap[item.category];
          return { ...item, category: newCategory, subcategory: newSubcategory };
        }
        return item;
      };

      setTransactions(prev => prev.map(migrateItem));
      setRecurringTransactions(prev => prev.map(migrateItem));
      setBills(prev => prev.map(migrateItem));

      localStorage.setItem('migrationVersion', '2');
       console.log("Migration complete.");
    }
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newTransactions: Transaction[] = [];
    const updatedRecurring = recurringTransactions.map(rec => {
      let nextDueDate = new Date(rec.nextDueDate + 'T00:00:00');
      const updatedRec = { ...rec };

      while (nextDueDate <= today) {
        const dueDateStr = nextDueDate.toISOString().split('T')[0];
        const occurrenceId = `${rec.id}-${nextDueDate.getTime()}`;
        // Prevent duplicates across dev double-effects by checking unique occurrence id
        const transactionExists = transactions.some(t => t.id === occurrenceId) ||
          newTransactions.some(t => t.id === occurrenceId) ||
          transactions.some(t => (
            t.description === rec.description && t.date === dueDateStr
          )) || newTransactions.some(t => (
            t.description === rec.description && t.date === dueDateStr
          ));

        if (!transactionExists) {
            newTransactions.push({
              id: occurrenceId,
              description: rec.description,
              amount: rec.amount,
              type: rec.type,
              date: dueDateStr,
              category: rec.category,
              subcategory: rec.subcategory,
              isRecurring: true,
              paymentMethod: PaymentMethod.DEBITO,
            });
        }
        
        if (rec.frequency === Frequency.MONTHLY) {
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }
        updatedRec.nextDueDate = nextDueDate.toISOString().split('T')[0];
      }
      return updatedRec;
    });

    if (newTransactions.length > 0) {
      // Mesclar com deduplicação por id (ou description+date quando id não existir)
      setTransactions(prev => {
        const seen = new Set<string>();
        const merged = [...prev, ...newTransactions];
        const unique = merged.filter(t => {
          const key = t.id || `${t.description}-${t.date}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        return unique;
      });
      setRecurringTransactions(updatedRecurring);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>, installmentCount?: number) => {
    if (installmentCount && installmentCount > 1 && transaction.type === TransactionType.EXPENSE) {
        const purchaseId = `inst-${new Date().getTime()}`;
        const totalAmount = transaction.amount;
        const installmentAmount = parseFloat((totalAmount / installmentCount).toFixed(2));
        const startDate = new Date(transaction.date + 'T00:00:00');
        
        const newTransactions: Transaction[] = [];

        for (let i = 0; i < installmentCount; i++) {
            const installmentDate = new Date(startDate);
            installmentDate.setMonth(startDate.getMonth() + i);

            newTransactions.push({
                ...transaction,
                id: `${purchaseId}-${i + 1}`,
                description: `${transaction.description} (${i + 1}/${installmentCount})`,
                amount: installmentAmount,
                date: installmentDate.toISOString().split('T')[0],
                installmentDetails: {
                    purchaseId,
                    current: i + 1,
                    total: installmentCount,
                    totalAmount: totalAmount,
                }
            });
        }
        setTransactions(prev => [...prev, ...newTransactions]);
    } else {
        const newTransaction: Transaction = {
            ...transaction,
            id: new Date().getTime().toString(),
        };
        setTransactions(prev => [...prev, newTransaction]);
    }
};
  
  const addMultipleTransactions = (transactionsToAdd: Omit<Transaction, 'id'>[]) => {
      const newTransactions: Transaction[] = transactionsToAdd.map((t, index) => ({
          ...t,
          id: `${new Date().getTime()}-${index}`,
      }));
      setTransactions(prev => [...prev, ...newTransactions]);
  }
  
    const addPayslip = (payslipData: Omit<Payslip, 'id'>, shouldLaunchTransaction: boolean) => {
        const newPayslip: Payslip = {
            ...payslipData,
            id: `payslip-${payslipData.year}-${payslipData.month}`,
        };
        setPayslips(prev => {
            const existingIndex = prev.findIndex(p => p.id === newPayslip.id);
            if (existingIndex > -1) {
                const updatedPayslips = [...prev];
                updatedPayslips[existingIndex] = newPayslip;
                return updatedPayslips;
            }
            return [...prev, newPayslip];
        });

        if (shouldLaunchTransaction) {
            const transactionDate = new Date(payslipData.year, payslipData.month, 1);

            const transactionData: Omit<Transaction, 'id'> = {
                description: `Salário ${new Date(payslipData.year, payslipData.month - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`,
                amount: payslipData.netTotal,
                type: TransactionType.INCOME,
                date: transactionDate.toISOString().split('T')[0],
                category: 'Receitas/Entradas',
                subcategory: 'BP',
                paymentMethod: PaymentMethod.OUTRO,
            };
            addTransaction(transactionData);
        }
    };

  const updateTransaction = (id: string, updatedTransaction: Omit<Transaction, 'id'>) => {
    setTransactions(transactions.map(t => t.id === id ? { ...updatedTransaction, id } : t));
  };

  const handleAttemptDelete = (transaction: Transaction) => {
    if (transaction.installmentDetails) {
        setTransactionToDelete(transaction);
        setIsDeleteInstallmentModalOpen(true);
    } else {
        setConfirmDeleteContext({ kind: 'transaction', transaction });
        setIsConfirmDeleteOpen(true);
    }
  };

  const deleteTransaction = (id: string, scope: 'single' | 'all-future') => {
    if (scope === 'single') {
        setTransactions(transactions.filter(t => t.id !== id));
    } else {
        const transaction = transactions.find(t => t.id === id);
        if (transaction?.installmentDetails) {
            const { purchaseId, current } = transaction.installmentDetails;
            setTransactions(transactions.filter(t => 
                !(t.installmentDetails?.purchaseId === purchaseId && t.installmentDetails.current >= current)
            ));
        }
    }
    setIsDeleteInstallmentModalOpen(false);
    setTransactionToDelete(null);
  };
  
  const handleAttemptDeleteBill = (id: string) => {
    setConfirmDeleteContext({ kind: 'bill', billId: id });
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteContext) return;
    if (confirmDeleteContext.kind === 'transaction' && confirmDeleteContext.transaction) {
      deleteTransaction(confirmDeleteContext.transaction.id, 'single');
    } else if (confirmDeleteContext.kind === 'bill' && confirmDeleteContext.billId) {
      deleteBill(confirmDeleteContext.billId);
    }
    setIsConfirmDeleteOpen(false);
    setConfirmDeleteContext(null);
  };
  
  const addBill = (bill: Omit<Bill, 'id' | 'recurringTransactionId'>) => {
    const billId = `bill-${new Date().getTime().toString()}`;
    let newBill: Bill = { ...bill, id: billId };
    let newRecurring: RecurringTransaction | null = null;

    if (bill.isAutoDebit && bill.amount && bill.category && bill.subcategory) {
        const recId = `rec-${billId}`;
        newBill.recurringTransactionId = recId;

        const today = new Date();
        let firstDueDate = new Date(today.getFullYear(), today.getMonth(), bill.dueDay);
        if (today.getDate() > bill.dueDay) {
            firstDueDate.setMonth(firstDueDate.getMonth() + 1);
        }
        
        newRecurring = {
            id: recId,
            description: bill.description,
            amount: bill.amount,
            type: TransactionType.EXPENSE,
            category: bill.category,
            subcategory: bill.subcategory,
            frequency: Frequency.MONTHLY,
            startDate: firstDueDate.toISOString().split('T')[0],
            nextDueDate: firstDueDate.toISOString().split('T')[0],
            linkedBillId: billId,
        };
    }

    setBills(prev => [...prev, newBill]);
    if (newRecurring) {
        setRecurringTransactions(prev => [...prev, newRecurring!]);
    }
  };


  const deleteBill = (id: string) => {
    const billToDelete = bills.find(bill => bill.id === id);
    if (billToDelete?.recurringTransactionId) {
        setRecurringTransactions(prev => prev.filter(rec => rec.id !== billToDelete.recurringTransactionId));
    }
    setBills(bills.filter(bill => bill.id !== id));
  };
  
  const handlePayBill = (billDescription: string) => {
    setBillToPayDescription(billDescription);
    setIsPayBillChoiceModalOpen(true);
  };
  
  const handleSelectQuickAdd = () => {
    setIsPayBillChoiceModalOpen(false);
    setQuickAddMode('ai');
    setQuickAddInitialDescription(billToPayDescription);
    setIsQuickAddModalOpen(true);
  };

  const handleSelectManualAdd = () => {
    setIsPayBillChoiceModalOpen(false);
    setQuickAddMode('manual');
    setQuickAddInitialDescription(billToPayDescription);
    setIsQuickAddModalOpen(true);
  };

  const handleOpenEditModal = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setTransactionToEdit(null);
    setIsEditModalOpen(false);
  };

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleFileSelected = (selectedFile: { content: string; mimeType: string }, type: 'nfe' | 'statement' | 'bp') => {
    setFileContent(selectedFile);
    if (type === 'nfe') {
        setIsNFeModalOpen(true);
    } else if (type === 'statement'){
        setIsStatementModalOpen(true);
    } else {
        setBpImportMode('ocr');
        setIsBPModalOpen(true);
    }
  };

  const handleFileSelectedBP = (selectedFile: { content: string; mimeType: string }, mode: 'ocr' | 'ai') => {
    setFileContent(selectedFile);
    setBpImportMode(mode);
    setIsBPModalOpen(true);
  };
  
  // Removidos: handlers CSV (import/export)

  const handleCloseModals = () => {
    setIsNFeModalOpen(false);
    setIsStatementModalOpen(false);
    setIsBPModalOpen(false);
    setIsManualBPModalOpen(false);
    setFileContent(null);
  }
  
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return transactions.filter(t => {
        const transactionDate = new Date(t.date + 'T00:00:00');
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const mainSummary = useMemo(() => {
    const income = currentMonthTransactions
      .filter(t => t.type === TransactionType.INCOME)
      // FIX: Ensure amount is treated as a number in arithmetic operations.
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const expense = currentMonthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      // FIX: Ensure amount is treated as a number in arithmetic operations.
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [currentMonthTransactions]);
  
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    transactions.forEach(t => {
        monthSet.add(t.date.slice(0, 7)); // 'YYYY-MM'
    });
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);

  const filteredTransactionsForList = useMemo(() => {
    return transactions
        .slice() // Create a shallow copy to avoid mutating the original array
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .filter(t => {
            if (monthFilter !== 'all') {
                return t.date.startsWith(monthFilter);
            }
            return true;
        })
        .filter(t => {
            if (paymentMethodFilter !== 'all') {
                return t.paymentMethod === paymentMethodFilter;
            }
            return true;
        })
        .filter(t => {
            switch (installmentFilter) {
                case 'single': return !t.installmentDetails;
                case 'installments': return !!t.installmentDetails;
                case 'all': default: return true;
            }
        });
  }, [transactions, installmentFilter, monthFilter, paymentMethodFilter]);
  
  const toggleCardVisibility = (cardId: string) => {
    setCardVisibility(prev => ({...prev, [cardId]: !prev[cardId]}));
  };
  
  const monthYearDisplay = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
  
  const confirmMessage = (() => {
    if (isConfirmDeleteOpen && confirmDeleteContext) {
      if (confirmDeleteContext.kind === 'transaction' && confirmDeleteContext.transaction) {
        const t = confirmDeleteContext.transaction;
        const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount) || 0);
        const data = new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR');
        return `Tem certeza que deseja excluir "${t.description}" de ${data} no valor de ${valor}?`;
      }
      if (confirmDeleteContext.kind === 'bill' && confirmDeleteContext.billId) {
        const bill = bills.find(b => b.id === confirmDeleteContext.billId);
        if (bill) {
          return `Tem certeza que deseja excluir a conta "${bill.description}" (vencimento dia ${String(bill.dueDay).padStart(2, '0')})?`;
        }
      }
    }
    return 'Tem certeza que deseja excluir este item?';
  })();
  
  const renderContent = () => {
    switch (activeTab) {
        case 'overview':
            return (
                <div className="space-y-8">
                    <h2 className="text-center text-lg font-semibold text-[var(--color-text-muted)] tracking-wider">{monthYearDisplay}</h2>
                    <Summary income={mainSummary.income} expense={mainSummary.expense} balance={mainSummary.balance} />
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                        <div className="xl:col-span-1 bg-[var(--card)] rounded-xl shadow-lg">
                           <UpcomingPayments bills={bills} onPayBill={handlePayBill} transactions={currentMonthTransactions} />
                        </div>
                        <div className="xl:col-span-2">
                             <TransactionList
                                transactions={currentMonthTransactions}
                                onDelete={handleAttemptDelete}
                                onEdit={handleOpenEditModal}
                                showFilters={false}
                            />
                        </div>
                    </div>
                </div>
            );
        case 'history':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                     <AddTransactionForm 
                        onAddTransaction={addTransaction}
                     />
                    <div className="lg:col-span-2">
                        <TransactionList
                            transactions={filteredTransactionsForList}
                            onDelete={handleAttemptDelete}
                            onEdit={handleOpenEditModal}
                            installmentFilter={installmentFilter}
                            onInstallmentFilterChange={setInstallmentFilter}
                            monthFilter={monthFilter}
                            onMonthFilterChange={setMonthFilter}
                            paymentMethodFilter={paymentMethodFilter}
                            onPaymentMethodFilterChange={setPaymentMethodFilter}
                         availableMonths={availableMonths}
                          showFilters={true}
                            onAnalyzePending={analyzePendingTransactions}
                            isAnalyzingPending={isAnalyzing}
                        />
                    </div>
                </div>
            );
        case 'bills':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <AddBillForm onAddBill={addBill} />
                    <BillList bills={bills} onDelete={handleAttemptDeleteBill} />
                </div>
            );
        case 'reports':
            return (
                <ReportsView
                    transactions={transactions}
                    allDashboardCards={sortedDashboardCards}
                    cardVisibility={cardVisibility}
                    onToggleCard={toggleCardVisibility}
                    onSetCardOrder={setCardOrder}
                />
            );
        case 'bp-analysis':
            return (
                <BPAnalysisView
                    payslips={payslips}
                    transactions={transactions}
                    onFileSelectedBP={handleFileSelectedBP}
                    onManualAdd={() => setIsManualBPModalOpen(true)}
                />
            );
        default:
            return null;
    }
  };

  const analyzePendingTransactions = async () => {
    try {
      setIsAnalyzing(true);
      setGlobalError(null);
      const pending = transactions.filter(t => t.category === 'A verificar');
      if (pending.length === 0) {
        setGlobalError("Nenhum registro marcado como 'A verificar' para analisar.");
        return;
      }

      // Prepare category structure for the model
      const availableCategories = JSON.stringify(
        Object.fromEntries(
          Object.keys(categories)
            .filter(catName => catName !== 'Receitas/Entradas')
            .map(catName => [catName, categories[catName].subcategories])
        ), null, 2
      );

      for (const t of pending) {
        try {
          const prompt = `Dada a descrição da transação: "${t.description}", sugira a categoria e subcategoria mais apropriada.
Responda APENAS com um objeto JSON contendo "category" e "subcategory".
Estrutura de categorias de despesa disponível:
${availableCategories}`;

          const response = await generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            expectJson: true,
          });

          const clean = (s: string) => s.replace(/```json/g, '').replace(/```/g, '').trim();
          let suggestion: { category?: string; subcategory?: string } = {};
          try {
            suggestion = JSON.parse(clean(response.text));
          } catch {
            suggestion = {};
          }

          if (suggestion.category && categories[suggestion.category]) {
            const chosenSub = suggestion.subcategory && categories[suggestion.category].subcategories.includes(suggestion.subcategory)
              ? suggestion.subcategory
              : categories[suggestion.category].subcategories[0];

            updateTransaction(t.id, {
              description: t.description,
              amount: t.amount,
              type: t.type,
              date: t.date,
              category: suggestion.category,
              subcategory: chosenSub,
              paymentMethod: t.paymentMethod,
              isRecurring: t.isRecurring,
              installmentDetails: t.installmentDetails,
            });
          }
        } catch (err) {
          console.warn('Falha ao classificar registro', t.id, err);
        }
      }
    } catch (e) {
      setGlobalError('Falha ao analisar registros. Verifique a configuração da IA.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Gate de autenticação: só exibe login quando auth está ativa
  if (isAuthActive && !session) {
    return <AuthGate onSignedIn={() => { /* sessão será atualizada via listener */ }} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--color-text)] font-sans flex flex-col">
      <Header 
        theme={theme} 
        setTheme={setTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickAdd={() => setIsQuickAddModalOpen(true)}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenInvite={() => setIsInviteModalOpen(true)}
        accountName={accountName || undefined}
        onLogoutClick={async () => {
          if (!isAuthActive) return; // no-op em modo sem autenticação
          try {
            await signOut();
          } catch (e) {
            console.error('Falha ao sair', e);
          }
        }}
        onPurgeAll={() => setIsPurgeAllOpen(true)}
      />
      
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {globalError && <div className="mb-4"><ErrorBanner message={globalError} onClose={() => setGlobalError(null)} /></div>}
        {renderContent()}
      </main>
      
      <footer className="text-center py-4">
        <p className="text-xs text-[var(--color-text-muted)]">
            Construído por Diego Sabá. Versão 0.1
        </p>
      </footer>

      {isNFeModalOpen && (
        <ImportNFeModal 
          isOpen={isNFeModalOpen} 
          onClose={handleCloseModals} 
          xmlContent={fileContent?.content ?? null}
          onConfirm={addMultipleTransactions}
        />
      )}

      {isStatementModalOpen && (
        <ImportStatementModal 
          isOpen={isStatementModalOpen} 
          onClose={handleCloseModals} 
          fileContent={fileContent?.content ?? null}
          onConfirm={addMultipleTransactions}
        />
      )}
      
      {isBPModalOpen && (
        <ImportBPModal 
          isOpen={isBPModalOpen} 
          onClose={handleCloseModals} 
          file={fileContent}
          mode={bpImportMode}
          onConfirm={addPayslip}
        />
      )}

      {isInviteModalOpen && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={handleCloseModals}
          accountId={accountId}
        />
      )}

      <ManualBPModal
        isOpen={isManualBPModalOpen}
        onClose={handleCloseModals}
        onConfirm={addPayslip}
      />

      <QuickAddModal 
        isOpen={isQuickAddModalOpen}
        onClose={() => {
            setIsQuickAddModalOpen(false);
            setQuickAddInitialDescription(undefined);
            setBillToPayDescription(undefined);
        }}
        onAddTransaction={addTransaction}
        initialDescription={quickAddInitialDescription}
        initialMode={quickAddMode}
      />
      
      {transactionToEdit && (
        <EditTransactionModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            transaction={transactionToEdit}
            onUpdate={updateTransaction}
        />
      )}
      
      {isDeleteInstallmentModalOpen && transactionToDelete && (
        <DeleteInstallmentModal
            isOpen={isDeleteInstallmentModalOpen}
            onClose={() => setIsDeleteInstallmentModalOpen(false)}
            transaction={transactionToDelete}
            onConfirmDelete={deleteTransaction}
        />
      )}

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setConfirmDeleteContext(null);
        }}
        onConfirm={handleConfirmDelete}
        title={confirmDeleteContext?.kind === 'bill' ? 'Confirmar exclusão da conta' : 'Confirmar exclusão do lançamento'}
        message={confirmMessage}
      />

       <PayBillChoiceModal
            isOpen={isPayBillChoiceModalOpen}
            onClose={() => setIsPayBillChoiceModalOpen(false)}
            onSelectQuick={handleSelectQuickAdd}
            onSelectManual={handleSelectManualAdd}
        />
        
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        userProfile={userProfile}
        onSave={setUserProfile}
      />
      <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      <ConfirmDialog
        isOpen={isPurgeAllOpen}
        onClose={() => setIsPurgeAllOpen(false)}
        onConfirm={async () => {
          try {
            if (isAuthActive) {
              if (!accountId) throw new Error('Conta não definida');
              await purgeAccountData(accountId);
            }
            // Em modo sem autenticação, apenas limpa localmente
            setTransactions([]);
            setRecurringTransactions([]);
            setBills([]);
            setPayslips([]);
            try {
              localStorage.removeItem('transactions');
              localStorage.removeItem('recurringTransactions');
              localStorage.removeItem('bills');
              localStorage.removeItem('payslips');
            } catch {}
            setIsPurgeAllOpen(false);
          } catch (e) {
            console.error('Falha ao apagar dados', e);
            alert('Falha ao apagar dados. Verifique políticas do Supabase.');
          }
        }}
        title={'Apagar todos os dados da conta'}
        message={'Isso removerá todos os lançamentos, recorrências, contas e contracheques desta conta. Esta ação é irreversível. Deseja continuar?'}
        confirmText={'Apagar tudo'}
      />

      {/* ExportModal e ImportTransactionsModal removidos */}
    </div>
  );
};

export default App;
