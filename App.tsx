
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, TransactionType, RecurringTransaction, Frequency, Bill, Payslip, PaymentMethod, FinancialGoal, Budget } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProfileMenu from './components/ProfileMenu';
import Logo from './components/Logo';
import ErrorBanner from './components/ui/error-banner';
import TransactionList from './components/TransactionList';
import AddTransactionForm from './components/AddTransactionForm';
import ImportNFeModal from './components/ImportNFeModal';
import ImportStatementModal from './components/ImportStatementModal';
import { categories } from './categories';
import QuickAddModal from './components/QuickAddModal';
import BillList from './components/BillList';
import AddBillForm from './components/AddBillForm';
import EditTransactionModal from './components/EditTransactionModal';
import ImportBPModal from './components/ImportBPModal';
import ManualBPModal from './components/ManualBPModal';
import BPAnalysisView from './components/BPAnalysisView';
import DeleteInstallmentModal from './components/DeleteInstallmentModal';
import ConfirmDialog from './components/ConfirmDialog';
import ReportsView from './components/ReportsView';
import PayBillChoiceModal from './components/PayBillChoiceModal';
import ProfileModal from './components/ProfileModal';
import InviteModal from './components/InviteModal';
import AcceptInviteModal from './components/AcceptInviteModal';
import SettingsModal from './components/SettingsModal';
import SecurityModal from './components/SecurityModal';
import IntelligentAnalysisCards from './components/IntelligentAnalysisCards';
import FinancialInsights from './components/FinancialInsights';
import EditBillModal from './components/EditBillModal';
import PeriodSummaryCard from './components/PeriodSummaryCard';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import IncomeBreakdown from './components/IncomeBreakdown';
import PendingInstallmentsCard from './components/report-cards/PendingInstallmentsCard';
import UnifiedExpenseAnalysisCard from './components/report-cards/UnifiedExpenseAnalysisCard';
import { generateContent, generateDeepSeekContent } from '@/lib/aiClient';
import AuthGate from './components/AuthGate';
import supabase, { isSupabaseEnabled, isAuthActive } from '@/lib/supabase';
import db, { getSession, signOut, ensureDefaultAccount, purgeAccountData } from '@/lib/db';
import { useFinanceStore } from './lib/store';
import DashboardContainer from './components/DashboardContainer';
import BudgetManagement from './components/BudgetManagement';
import BudgetModal from './components/BudgetModal';
import GoalsView from './components/GoalsView';
import GoalModal from './components/GoalModal';
import { useAIAnalysis } from './hooks/useAIAnalysis';
import MobileNavbar from './components/MobileNavbar';

export interface DashboardCardConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: React.FC<any>;
}

const defaultPhotoUrl = 'https://i.ibb.co/6n20d5w/placeholder-profile.png';

const defaultProfile = {
  name: 'Seu Nome',
  email: '',
  dob: '',
  gender: 'Outro',
  photo: 'https://i.ibb.co/6n20d5w/placeholder-profile.png'
};

const App: React.FC = () => {
  const {
    session, setSession,
    accountId, setAccountId,
    accountName, setAccountName,
    transactions, setTransactions,
    payslips, setPayslips,
    recurringTransactions, setRecurringTransactions,
    bills, setBills,
    budgets, setBudgets,
    goals, setGoals,
    userProfile, setUserProfile,
    updateTransaction, updateBill,
    fetchData, syncData
  } = useFinanceStore();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const { analyzeTransactions, isAnalyzing, analysisError, setAnalysisError } = useAIAnalysis();
  const [isConfirmAnalyzeOpen, setIsConfirmAnalyzeOpen] = useState(false);
  const [analyzeScope, setAnalyzeScope] = useState<'all' | 'pending'>('pending');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<FinancialGoal | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    if (isSupabaseEnabled) return;

    const readArray = <T,>(key: string): T[] | null => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as T[]) : null;
      } catch {
        return null;
      }
    };

    const savedTransactions = readArray<Transaction>('transactions');
    const savedPayslips = readArray<Payslip>('payslips');
    const savedRecurring = readArray<RecurringTransaction>('recurringTransactions');
    const savedBills = readArray<Bill>('bills');
    const savedBudgets = readArray<Budget>('budgets');
    const savedGoals = readArray<FinancialGoal>('goals');

    if (savedTransactions && savedTransactions.length > 0) {
      setTransactions(savedTransactions.map(t => ({ ...t, paymentMethod: t.paymentMethod || PaymentMethod.OUTRO })));
    }
    if (savedPayslips && savedPayslips.length > 0) setPayslips(savedPayslips);
    if (savedRecurring && savedRecurring.length > 0) setRecurringTransactions(savedRecurring);
    if (savedBills && savedBills.length > 0) setBills(savedBills);
    if (savedBudgets && savedBudgets.length > 0) setBudgets(savedBudgets);
    if (savedGoals && savedGoals.length > 0) setGoals(savedGoals);
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
      try { localStorage.setItem('transactions', JSON.stringify(unique)); } catch (e) { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (newProfile: any) => {
    setUserProfile(newProfile);
    try {
      localStorage.setItem('userProfile', JSON.stringify(newProfile));
      if (isAuthActive && session?.user?.id) {
        await db.upsertUserProfile({
          id: session.user.id,
          ...newProfile,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('Falha ao salvar perfil', e);
    }
  };

  // Supabase Auth: obter sessão e escutar mudanças (apenas quando auth está ativa)
  useEffect(() => {
    if (!isAuthActive) {
      setIsCheckingSession(false);
      return;
    }
    let mounted = true;
    (async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(s);
        setIsCheckingSession(false);
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      console.log('App: Auth State Change:', _event, s?.user?.email);
      setSession(s ?? null);
      setIsCheckingSession(false);
    });
    return () => { mounted = false; sub?.subscription?.unsubscribe(); };
  }, []);

  // Após autenticar, garantir accountId (workspace) e armazenar (apenas quando auth está ativa)
  useEffect(() => {
    if (!isAuthActive || !session?.user?.id) return;
    let mounted = true;
    (async () => {
      try {
        console.log('App: Garantindo conta padrão para o usuário:', session.user.id);
        const { accountId: accId, name } = await ensureDefaultAccount(session.user.id);
        console.log('App: Conta garantida com ID:', accId);
        if (!mounted) return;
        setAccountId(accId);
        setAccountName(name || null);
        try { localStorage.setItem('accountId', accId); } catch {/* ignore */ }
        try { if (name) localStorage.setItem('accountName', name); } catch {/* ignore */ }
      } catch (e) {
        console.error('Falha ao garantir conta padrão', e);
      }
    })();
    return () => { mounted = false; };
  }, [session]);



  // Ao autenticar, buscar dados do Supabase e preencher estados (apenas quando auth está ativa)
  useEffect(() => {
    if (accountId) fetchData(accountId);
  }, [session, accountId]);

  // Sincronizar alterações locais com Supabase (apenas quando auth está ativa)
  useEffect(() => {
    if (accountId) syncData(accountId);
  }, [transactions, recurringTransactions, bills, payslips, budgets, goals, session, accountId]);

  // Carregar perfil do Supabase
  useEffect(() => {
    if (!isAuthActive || !session?.user?.id) return;
    (async () => {
      try {
        const profile = await db.fetchUserProfile(session.user.id);
        const sessionName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '';

        if (profile) {
          // Mesclar com o que já temos localmente (ou defaults)
          const mergedProfile = {
            ...userProfile,
            ...profile,
            name: profile.name && profile.name !== 'Seu Nome' ? profile.name : (sessionName || userProfile.name),
            email: session.user.email || profile.email || userProfile.email
          };
          setUserProfile(mergedProfile);

          // Se o nome no DB estava vazio ou default, mas o session tem nome, atualiza o DB
          if ((!profile.name || profile.name === 'Seu Nome') && sessionName) {
            await db.upsertUserProfile({ id: session.user.id, ...mergedProfile });
          }
        } else if (!hasCheckedProfile) {
          // Primeiro login e sem perfil no banco: usa dados da rede social
          const socialProfile = {
            name: sessionName || 'Novo Usuário',
            email: session.user.email || '',
            dob: '',
            gender: 'Outro',
            photo: session.user.user_metadata?.avatar_url || 'https://i.ibb.co/6n20d5w/placeholder-profile.png'
          };

          setUserProfile(prev => {
            // Se o nome atual ainda for o default "Seu Nome", usa o da rede social
            if (prev.name === 'Seu Nome' || !prev.name) return socialProfile;
            return prev;
          });

          // Cria o perfil inicial no banco
          await db.upsertUserProfile({ id: session.user.id, ...socialProfile });

          // Se for o primeiro login E não tem nome definido, abre o modal
          if (!socialProfile.name || socialProfile.name === 'Seu Nome' || socialProfile.name === 'Novo Usuário') {
            setIsProfileModalOpen(true);
          }
        }
        setHasCheckedProfile(true);
      } catch (e) {
        console.error('Falha ao carregar perfil do Supabase', e);
      }
    })();
  }, [session]);

  // Checar por convites pendentes
  useEffect(() => {
    if (!isAuthActive || !session?.user?.email) return;
    (async () => {
      try {
        const invites = await db.fetchMyInvites(session.user.email);
        // Filtra convites para contas que não sejam a atual
        const filteredInvites = invites ? invites.filter((i: any) => i.account_id !== accountId) : [];
        if (filteredInvites.length > 0) {
          setPendingInvites(filteredInvites);
          setIsAcceptInviteModalOpen(true);
        }
      } catch (e) {
        console.error('Falha ao checar convites', e);
      }
    })();
  }, [session, accountId]);

  const allDashboardCards: DashboardCardConfig[] = useMemo(() => [
    {
      id: 'aiInsightsCards',
      title: 'Análises Inteligentes (Cards)',
      description: 'Insights curtos gerados pela IA em formato de cartões.',
      icon: 'fa-wand-magic-sparkles',
      component: IntelligentAnalysisCards,
    },
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
      id: 'unifiedExpenseAnalysis',
      title: 'Análise Unificada de Gastos',
      description: 'Visão completa de gastos por categoria e método de pagamento.',
      icon: 'fa-chart-pie',
      component: UnifiedExpenseAnalysisCard,
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
      } catch (e) { /* fall through */ }
    }
    // Default visibility
    return {
      aiInsightsCards: true,
      financialInsights: true,
      periodSummary: true,
      expenseBreakdown: true,
      incomeBreakdown: true,
      unifiedExpenseAnalysis: true,
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
  const [pendingPayslipData, setPendingPayslipData] = useState<Omit<Payslip, 'id'> | null>(null);
  const [fileContent, setFileContent] = useState<{ content: string; mimeType: string } | null>(null);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [quickAddInitialDescription, setQuickAddInitialDescription] = useState<string | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditBillModalOpen, setIsEditBillModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [billToEdit, setBillToEdit] = useState<Bill | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteInstallmentModalOpen, setIsDeleteInstallmentModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [confirmDeleteContext, setConfirmDeleteContext] = useState<{
    kind: 'transaction' | 'bill';
    transaction?: Transaction;
    billId?: string;
  } | null>(null);
  const [installmentFilter, setInstallmentFilter] = useState<'all' | 'single' | 'installments'>('all');
  const [monthFilter, setMonthFilter] = useState<'all' | string>(() => {
    return new Date().toISOString().slice(0, 7); // Default to current month YYYY-MM
  });
  const [dashboardMonth, setDashboardMonth] = useState(new Date().toISOString().slice(0, 7));

  const handleDashboardMonthChange = (direction: 'prev' | 'next') => {
    const [year, month] = dashboardMonth.split('-').map(Number);
    const date = new Date(year, month - 1);
    date.setMonth(direction === 'next' ? date.getMonth() + 1 : date.getMonth() - 1);
    setDashboardMonth(date.toISOString().slice(0, 7));
  };

  const dashboardMonthDisplay = useMemo(() => {
    const [year, month] = dashboardMonth.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
  }, [dashboardMonth]);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [isPayBillChoiceModalOpen, setIsPayBillChoiceModalOpen] = useState(false);
  const [billToPayDescription, setBillToPayDescription] = useState<string | undefined>(undefined);
  const [quickAddMode, setQuickAddMode] = useState<'ai' | 'manual'>('ai');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [isAcceptInviteModalOpen, setIsAcceptInviteModalOpen] = useState(false);
  const [isProfileMenuOpenMobile, setIsProfileMenuOpenMobile] = useState(false);

  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpenMobile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



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

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

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
          createdBy: session?.user?.id,
          createdByName: userProfile?.name,
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
        createdBy: session?.user?.id,
        createdByName: userProfile?.name,
      };
      setTransactions(prev => [...prev, newTransaction]);
    }
  };

  const updateTransactionWithInstallments = (id: string, updated: Omit<Transaction, 'id'>, installmentCount: number = 1) => {
    const normalizeBaseDescription = (val: string) => val.replace(/\s\(\d+\/\d+\)$/, '');
    const splitAmounts = (totalAmount: number, count: number) => {
      const totalCents = Math.round((Number(totalAmount) || 0) * 100);
      const base = Math.floor(totalCents / count);
      const cents: number[] = Array.from({ length: count }, () => base);
      cents[count - 1] = totalCents - base * (count - 1);
      return cents.map(v => v / 100);
    };

    setTransactions(prev => {
      const existing = prev.find(t => t.id === id);
      if (!existing) return prev;

      const baseDescription = normalizeBaseDescription(updated.description || existing.description);
      const nextBase: Omit<Transaction, 'id'> = {
        ...existing,
        ...updated,
        description: baseDescription,
        paymentMethod: updated.paymentMethod || existing.paymentMethod || PaymentMethod.OUTRO,
      };

      const wantInstallments = nextBase.type === TransactionType.EXPENSE && installmentCount > 1;

      const buildSeries = (purchaseId: string) => {
        const totalAmount = Number(nextBase.amount) || 0;
        const amounts = splitAmounts(totalAmount, installmentCount);
        const startDate = new Date(nextBase.date + 'T00:00:00');

        return amounts.map((amt, idx) => {
          const installmentDate = new Date(startDate);
          installmentDate.setMonth(startDate.getMonth() + idx);
          return {
            ...nextBase,
            id: `${purchaseId}-${idx + 1}`,
            description: `${baseDescription} (${idx + 1}/${installmentCount})`,
            amount: amt,
            date: installmentDate.toISOString().split('T')[0],
            createdBy: existing.createdBy,
            createdByName: existing.createdByName,
            installmentDetails: {
              purchaseId,
              current: idx + 1,
              total: installmentCount,
              totalAmount: totalAmount,
            }
          } as Transaction;
        });
      };

      if (existing.installmentDetails) {
        const purchaseId = existing.installmentDetails.purchaseId;
        const withoutPurchase = prev.filter(t => t.installmentDetails?.purchaseId !== purchaseId);

        if (!wantInstallments) {
          const single: Transaction = {
            ...existing,
            ...nextBase,
            id: existing.id,
            description: baseDescription,
            amount: Number(nextBase.amount) || 0,
            installmentDetails: undefined,
          };
          return [...withoutPurchase, single];
        }

        return [...withoutPurchase, ...buildSeries(purchaseId)];
      }

      if (!wantInstallments) {
        const single: Transaction = {
          ...existing,
          ...nextBase,
          id: existing.id,
          description: baseDescription,
          amount: Number(nextBase.amount) || 0,
          installmentDetails: undefined,
        };
        return prev.map(t => (t.id === id ? single : t));
      }

      const purchaseId = `inst-${new Date().getTime()}`;
      const withoutExisting = prev.filter(t => t.id !== id);
      return [...withoutExisting, ...buildSeries(purchaseId)];
    });
  };

  const addMultipleTransactions = (transactionsToAdd: Omit<Transaction, 'id'>[]) => {
    const newTransactions: Transaction[] = transactionsToAdd.map((t, index) => ({
      ...t,
      id: `${new Date().getTime()}-${index}`,
      createdBy: session?.user?.id,
      createdByName: userProfile?.name,
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


  const handleAttemptDelete = (transaction: Transaction) => {
    if (transaction.installmentDetails) {
      setTransactionToDelete(transaction);
      setIsDeleteInstallmentModalOpen(true);
    } else {
      setConfirmDeleteContext({ kind: 'transaction', transaction });
      setIsConfirmDeleteOpen(true);
    }
  };

  const handleDeleteTransaction = (id: string, scope: 'single' | 'all-future') => {
    if (scope === 'single') {
      const { deleteTransaction } = useFinanceStore.getState();
      deleteTransaction(id);
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
      handleDeleteTransaction(confirmDeleteContext.transaction.id, 'single');
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

  const handleOpenEditBudgetModal = (budget: Budget) => {
    setBudgetToEdit(budget);
    setIsBudgetModalOpen(true);
  };

  const handleOpenEditModal = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setTransactionToEdit(null);
    setIsEditModalOpen(false);
  };

  const handleOpenEditBillModal = (bill: Bill) => {
    console.log('Abrindo modal de edição para conta:', bill);
    setBillToEdit(bill);
    setIsEditBillModalOpen(true);
  };

  const handleUpdateBill = (id: string, updates: Partial<Bill>) => {
    updateBill(id, updates);
  };



  const handleFileSelected = (selectedFile: { content: string; mimeType: string }, type: 'nfe' | 'statement' | 'bp') => {
    setFileContent(selectedFile);
    if (type === 'nfe') {
      setIsNFeModalOpen(true);
    } else if (type === 'statement') {
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
    setIsInviteModalOpen(false);
    setFileContent(null);
    setPendingPayslipData(null);
  }



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
    setCardVisibility(prev => ({ ...prev, [cardId]: !prev[cardId] }));
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
          <DashboardContainer
            dashboardMonth={dashboardMonth}
            onMonthChange={handleDashboardMonthChange}
            onPayBill={handlePayBill}
            onEditTransaction={handleOpenEditModal}
            onDeleteTransaction={handleAttemptDelete}
          />
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
                onAnalyze={(scope) => {
                  setAnalyzeScope(scope);
                  setIsConfirmAnalyzeOpen(true);
                }}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </div>
        );
      case 'bills':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <AddBillForm onAddBill={addBill} />
            <BillList bills={bills} onDelete={handleAttemptDeleteBill} onEdit={handleOpenEditBillModal} />
          </div>
        );
      case 'reports':
        return <ReportsView transactions={transactions} />;
      case 'budgets':
        return (
          <BudgetManagement
            onAddBudget={() => {
              setBudgetToEdit(null);
              setIsBudgetModalOpen(true);
            }}
            onEditBudget={handleOpenEditBudgetModal}
          />
        );
      case 'goals':
        return (
          <GoalsView
            onAddGoal={() => {
              setGoalToEdit(null);
              setIsGoalModalOpen(true);
            }}
            onEditGoal={(goal) => {
              setGoalToEdit(goal);
              setIsGoalModalOpen(true);
            }}
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

  const handleAnalyzeConfirm = async () => {
    await analyzeTransactions(transactions, updateTransaction, analyzeScope);
  };

  // Placeholder de carregamento enquanto valida sessão
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
        <Logo size={80} color="white" className="animate-pulse mb-8" />
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-full bg-[var(--primary)]"
          />
        </div>
      </div>
    );
  }

  // Gate de autenticação: só exibe login quando auth está ativa
  if (isAuthActive && !session) {
    return <AuthGate onSignedIn={() => { /* sessão será atualizada via listener */ }} />;
  }

  return (
    <div className="h-screen bg-[var(--background)] text-[var(--color-text)] font-sans flex flex-col lg:flex-row overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickAdd={() => setIsQuickAddModalOpen(true)}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenInvite={() => setIsInviteModalOpen(true)}
        isAuthActive={isAuthActive && !!session}
        accountName={accountName || undefined}
        onLogoutClick={async () => {
          if (!isAuthActive) return;
          try { await signOut(); } catch (e) { console.error('Falha ao sair', e); }
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
      />

      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-6 pb-4 bg-white/50 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#0A0A0A] rounded-[1rem] flex items-center justify-center border border-white/10 shadow-lg">
            <Logo size={28} color="white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.2em] text-gray-900 uppercase leading-none">
              FINANCE
            </h1>
            <span className="text-[10px] font-black text-[var(--primary)] tracking-[0.3em] uppercase">PILOT</span>
          </div>
        </div>
        <div className="relative" ref={mobileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpenMobile(!isProfileMenuOpenMobile)}
            className="relative active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-xl ring-1 ring-gray-100">
              {userProfile?.photo && userProfile.photo !== defaultPhotoUrl ? (
                <img src={userProfile.photo} alt="P" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-black text-xs">
                  {userProfile?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
          </button>

          <AnimatePresence>
            {isProfileMenuOpenMobile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-2 w-[220px] z-[100]"
              >
                <ProfileMenu
                  onProfileClick={() => { setIsProfileMenuOpenMobile(false); setIsProfileModalOpen(true); }}
                  onInviteClick={() => { setIsProfileMenuOpenMobile(false); setIsInviteModalOpen(true); }}
                  onSettingsClick={() => { setIsProfileMenuOpenMobile(false); setIsSettingsModalOpen(true); }}
                  onSecurityClick={() => { setIsProfileMenuOpenMobile(false); setIsSecurityModalOpen(true); }}
                  onLogoutClick={async () => {
                    setIsProfileMenuOpenMobile(false);
                    if (!isAuthActive) return;
                    try { await signOut(); } catch (e) { console.error('Falha ao sair', e); }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-4 lg:pt-10 pb-32 lg:pb-10 h-full overflow-y-auto custom-scrollbar scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        <footer className="text-center py-16 mt-16 border-t border-gray-100/50">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
            Finance Pilot <span className="text-[var(--primary)] mx-2">•</span> 2025
          </p>
        </footer>
      </main>

      <MobileNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickAdd={() => setIsQuickAddModalOpen(true)}
      />

      {/* Modals */}
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
          onEdit={(data) => {
            setPendingPayslipData(data);
            setIsBPModalOpen(false);
            setIsManualBPModalOpen(true);
          }}
        />
      )}

      {isInviteModalOpen && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={handleCloseModals}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          hasSession={!!session}
          accountId={accountId}
        />
      )}

      <ManualBPModal
        isOpen={isManualBPModalOpen}
        onClose={handleCloseModals}
        initialData={pendingPayslipData}
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
          onUpdate={updateTransactionWithInstallments}
        />
      )}

      {billToEdit && (
        <EditBillModal
          key={billToEdit.id}
          isOpen={isEditBillModalOpen}
          onClose={() => { setIsEditBillModalOpen(false); setBillToEdit(null); }}
          bill={billToEdit}
          onUpdate={handleUpdateBill}
        />
      )}

      {isDeleteInstallmentModalOpen && transactionToDelete && (
        <DeleteInstallmentModal
          isOpen={isDeleteInstallmentModalOpen}
          onClose={() => setIsDeleteInstallmentModalOpen(false)}
          transaction={transactionToDelete}
          onConfirmDelete={handleDeleteTransaction}
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

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgetToEdit={budgetToEdit}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSave={handleSaveProfile}
      />

      {isAcceptInviteModalOpen && session && (
        <AcceptInviteModal
          isOpen={isAcceptInviteModalOpen}
          onClose={() => setIsAcceptInviteModalOpen(false)}
          invites={pendingInvites}
          userId={session.user.id}
          onAccepted={(newAccountId) => {
            setAccountId(newAccountId);
            fetchData(newAccountId);
          }}
        />
      )}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        accountId={accountId}
        onDataChanged={fetchData}
      />
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        userEmail={session?.user?.email}
        lastSignIn={session?.user?.last_sign_in_at}
        onPurgeData={async () => {
          if (!accountId) throw new Error('Conta não definida');
          await purgeAccountData(accountId);
          setTransactions([]);
          setRecurringTransactions([]);
          setBills([]);
          setPayslips([]);
          setBudgets([]);
          setGoals([]);
          try {
            localStorage.removeItem('transactions');
            localStorage.removeItem('recurringTransactions');
            localStorage.removeItem('bills');
            localStorage.removeItem('payslips');
            localStorage.removeItem('budgets');
            localStorage.removeItem('goals');
          } catch { }
        }}
      />

      <ConfirmDialog
        isOpen={isConfirmAnalyzeOpen}
        onClose={() => setIsConfirmAnalyzeOpen(false)}
        onConfirm={async () => {
          setIsConfirmAnalyzeOpen(false);
          await handleAnalyzeConfirm();
        }}
        title={'Confirmar análise por IA'}
        message={`Você está prestes a analisar ${analyzeScope === 'all' ? 'TODAS as transações' : 'apenas transações "A Verificar"'}. Isso consumirá créditos de IA. Deseja continuar?`}
        confirmText={'Analisar'}
      />
    </div>
  );
};

export default App;
