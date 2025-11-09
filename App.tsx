

import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, RecurringTransaction, Frequency, Bill, Payslip, PaymentMethod } from './types';
import Header from './components/Header';
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
import ExportModal from './components/ExportModal';
import ImportTransactionsModal from './components/ImportTransactionsModal';


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

const convertToCSV = (transactions: Transaction[]): string => {
    const headers = ['id', 'description', 'amount', 'type', 'date', 'category', 'subcategory', 'paymentMethod', 'isRecurring', 'purchaseId', 'current', 'total', 'totalAmount'];
    
    const escapeCsvField = (field: any): string => {
        const stringValue = (field === null || field === undefined) ? '' : String(field);
        if (/[",\n]/.test(stringValue)) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const objectToCsvRow = (obj: Transaction) => {
        return [
            escapeCsvField(obj.id),
            escapeCsvField(obj.description),
            escapeCsvField(obj.amount),
            escapeCsvField(obj.type),
            escapeCsvField(obj.date),
            escapeCsvField(obj.category),
            escapeCsvField(obj.subcategory),
            escapeCsvField(obj.paymentMethod),
            escapeCsvField(obj.isRecurring),
            escapeCsvField(obj.installmentDetails?.purchaseId),
            escapeCsvField(obj.installmentDetails?.current),
            escapeCsvField(obj.installmentDetails?.total),
            escapeCsvField(obj.installmentDetails?.totalAmount),
        ].join(',');
    };

    const csvRows = [headers.join(',')];
    transactions.forEach(t => csvRows.push(objectToCsvRow(t)));
    return csvRows.join('\n');
};

const parseCSV = (csvContent: string): Transaction[] => {
    const lines = csvContent.trim().split('\n');
    const headerLine = lines.shift();
    if (!headerLine) return [];

    const headers = headerLine.split(',').map(h => h.trim());
    const idIndex = headers.indexOf('id');
    // ... get other indices

    return lines.map(line => {
        // A simple split won't work for descriptions with commas. 
        // This is a simplified parser assuming no commas in text fields for now.
        // A robust implementation would handle quoted fields.
        const values = line.split(',');
        const obj = headers.reduce((acc, h, i) => {
            acc[h] = values[i];
            return acc;
        }, {} as Record<string, string>);

        const transaction: Transaction = {
            id: obj.id,
            description: obj.description,
            amount: parseFloat(obj.amount),
            type: obj.type as TransactionType,
            date: obj.date,
            category: obj.category,
            subcategory: obj.subcategory,
            paymentMethod: obj.paymentMethod as PaymentMethod,
            isRecurring: obj.isRecurring === 'true',
        };

        if (obj.purchaseId) {
            transaction.installmentDetails = {
                purchaseId: obj.purchaseId,
                current: parseInt(obj.current, 10),
                total: parseInt(obj.total, 10),
                totalAmount: parseFloat(obj.totalAmount),
            };
        }
        return transaction;
    });
};

const App: React.FC = () => {
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
  const [isManualBPModalOpen, setIsManualBPModalOpen] = useState(false);
  const [fileContent, setFileContent] = useState<{ content: string; mimeType: string } | null>(null);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [quickAddInitialDescription, setQuickAddInitialDescription] = useState<string | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteInstallmentModalOpen, setIsDeleteInstallmentModalOpen] = useState(false);
  const [installmentFilter, setInstallmentFilter] = useState<'all' | 'single' | 'installments'>('all');
  const [monthFilter, setMonthFilter] = useState<'all' | string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [isPayBillChoiceModalOpen, setIsPayBillChoiceModalOpen] = useState(false);
  const [billToPayDescription, setBillToPayDescription] = useState<string | undefined>(undefined);
  const [quickAddMode, setQuickAddMode] = useState<'ai' | 'manual'>('ai');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportConfirmModalOpen, setIsImportConfirmModalOpen] = useState(false);
  const [transactionsToImport, setTransactionsToImport] = useState<Transaction[]>([]);

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
        const transactionExists = transactions.some(t => 
            t.description === rec.description &&
            new Date(t.date).getTime() === nextDueDate.getTime()
        );

        if (!transactionExists) {
            newTransactions.push({
              id: `${rec.id}-${nextDueDate.getTime()}`,
              description: rec.description,
              amount: rec.amount,
              type: rec.type,
              date: nextDueDate.toISOString().split('T')[0],
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
      setTransactions(prev => [...prev, ...newTransactions]);
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
        deleteTransaction(transaction.id, 'single');
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

  const handleFileSelected = (selectedFile: { content: string; mimeType: string }, type: 'nfe' | 'statement' | 'bp') => {
    setFileContent(selectedFile);
    if (type === 'nfe') {
        setIsNFeModalOpen(true);
    } else if (type === 'statement'){
        setIsStatementModalOpen(true);
    } else {
        setIsBPModalOpen(true);
    }
  };
  
   const handleCSVFileSelected = (csvContent: string) => {
        try {
            const parsed = parseCSV(csvContent);
            const existingIds = new Set(transactions.map(t => t.id));
            const newTransactions = parsed.filter(t => t.id && !existingIds.has(t.id));
            
            if (newTransactions.length > 0) {
                setTransactionsToImport(newTransactions);
                setIsImportConfirmModalOpen(true);
            } else {
                alert("Nenhum lançamento novo encontrado para importar (IDs já existentes).");
            }
        } catch (error) {
            console.error("Error parsing CSV:", error);
            alert("Erro ao ler o arquivo CSV. Verifique o formato do arquivo.");
        }
    };
    
    const handleConfirmImport = () => {
        setTransactions(prev => [...prev, ...transactionsToImport]);
        setTransactionsToImport([]);
        setIsImportConfirmModalOpen(false);
    };
    
    const handleExport = (start: string, end: string) => {
        const startDate = new Date(start + 'T00:00:00');
        const endDate = new Date(end + 'T23:59:59');

        const filtered = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startDate && tDate <= endDate;
        });

        if (filtered.length === 0) {
            alert("Nenhum lançamento encontrado no período selecionado.");
            return;
        }

        const csvString = convertToCSV(filtered);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `lancamentos_${start}_a_${end}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsExportModalOpen(false);
    };

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
  
  const renderContent = () => {
    switch (activeTab) {
        case 'overview':
            return (
                <div className="space-y-8">
                    <h2 className="text-center text-lg font-semibold text-gray-500 dark:text-gray-400 tracking-wider">{monthYearDisplay}</h2>
                    <Summary income={mainSummary.income} expense={mainSummary.expense} balance={mainSummary.balance} />
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                        <div className="xl:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
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
                        onFileSelected={handleFileSelected} 
                        onExportClick={() => setIsExportModalOpen(true)}
                        onCSVFileSelected={handleCSVFileSelected}
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
                        />
                    </div>
                </div>
            );
        case 'bills':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <AddBillForm onAddBill={addBill} />
                    <BillList bills={bills} onDelete={deleteBill} />
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
                    onFileSelected={handleFileSelected}
                    onManualAdd={() => setIsManualBPModalOpen(true)}
                />
            );
        default:
            return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans flex flex-col">
      <Header 
        theme={theme} 
        setTheme={setTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickAdd={() => setIsQuickAddModalOpen(true)}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenInvite={() => setIsInviteModalOpen(true)}
      />
      
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {renderContent()}
      </main>
      
      <footer className="text-center py-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
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
          onConfirm={addPayslip}
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

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />

      <ImportTransactionsModal
        isOpen={isImportConfirmModalOpen}
        onClose={() => setIsImportConfirmModalOpen(false)}
        transactions={transactionsToImport}
        onConfirm={handleConfirmImport}
      />
    </div>
  );
};

export default App;