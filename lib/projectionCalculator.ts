import { Transaction, Bill, TransactionType, FinancialGoal, Budget } from '../types';

const toLocalDate = (dateStr: string) => new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);

/**
 * Calcula o saldo atual baseado nas transações
 */
export function calculateCurrentBalance(transactions: Transaction[]): number {
    return transactions.reduce((acc, t) => {
        const amount = Number(t.amount) || 0;
        return t.type === TransactionType.INCOME ? acc + amount : acc - amount;
    }, 0);
}

/**
 * Calcula a previsão de fechamento do mês (modo realista)
 */
export function calculateMonthEndProjection(
    transactions: Transaction[],
    bills: Bill[],
    currentMonth: string
): number {
    const today = new Date();
    const [year, month] = currentMonth.split('-').map(Number);

    // Último dia do mês
    const endOfMonth = new Date(year, month, 0);
    const daysInMonth = endOfMonth.getDate();
    const currentDay = today.getDate();

    // Se já estamos no último dia, retorna o saldo atual
    if (currentDay >= daysInMonth) {
        return calculateCurrentBalance(transactions);
    }

    // 1. Saldo atual (já realizado)
    const currentBalance = calculateCurrentBalance(transactions);

    // 2. Contas fixas a vencer até o final do mês
    // Bills têm apenas dueDay (1-31), precisamos verificar se já foi paga no mês atual via transactions
    const upcomingBillsTotal = bills
        .filter(b => {
            // Se o dueDay já passou hoje, ignora
            if (b.dueDay <= currentDay) return false;

            // Verifica se já foi paga este mês checando nas transações
            const billDate = `${year}-${String(month).padStart(2, '0')}-${String(b.dueDay).padStart(2, '0')}`;
            const alreadyPaid = transactions.some(t =>
                t.date === billDate &&
                t.description.toLowerCase().includes(b.description.toLowerCase())
            );

            return !alreadyPaid;
        })
        .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    // 3. Média de gastos variáveis diários (últimos 15 dias ou menos)
    const lastDays = Math.min(15, currentDay);
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() - lastDays);

    const recentExpenses = transactions
        .filter(t => {
            if (t.type !== TransactionType.EXPENSE) return false;
            const txDate = toLocalDate(t.date);
            return txDate >= cutoffDate && txDate <= today;
        });

    const totalRecentExpenses = recentExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const avgDailyExpense = lastDays > 0 ? totalRecentExpenses / lastDays : 0;

    // 4. Projeção de gastos para dias restantes
    const daysRemaining = daysInMonth - currentDay;
    const projectedVariableExpenses = avgDailyExpense * daysRemaining;

    // 5. Saldo previsto = Atual - Contas a Vencer - Gastos Variáveis Projetados
    return currentBalance - upcomingBillsTotal - projectedVariableExpenses;
}

/**
 * Calcula a taxa de queima diária (burn rate)
 */
export function calculateDailyBurnRate(transactions: Transaction[], days: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentExpenses = transactions
        .filter(t => {
            if (t.type !== TransactionType.EXPENSE) return false;
            const txDate = toLocalDate(t.date);
            return txDate >= cutoffDate;
        });

    const totalExpenses = recentExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return days > 0 ? totalExpenses / days : 0;
}

/**
 * Retorna os próximos compromissos financeiros (contas + parcelas)
 */
export function getUpcomingCommitments(
    bills: Bill[],
    transactions: Transaction[],
    limit: number = 5
): Array<{
    date: Date;
    description: string;
    amount: number;
    status: 'paid' | 'urgent' | 'upcoming';
    icon: string;
}> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const commitments = bills
        .map(b => {
            // Construir a data de vencimento baseada no dueDay
            let dueDate = new Date(currentYear, currentMonth - 1, b.dueDay);
            dueDate.setHours(0, 0, 0, 0); // Normalizar para comparação

            // Se o due day já passou este mês, considera o próximo mês
            if (dueDate < today) {
                dueDate = new Date(currentYear, currentMonth, b.dueDay); // Mês seguinte
                dueDate.setHours(0, 0, 0, 0);
            }

            let status: 'paid' | 'urgent' | 'upcoming' = 'upcoming';
            let icon = '📅';

            // Verifica se já foi paga checando nas transações
            const billDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
            const alreadyPaid = transactions.some(t =>
                t.date === billDateStr &&
                t.description.toLowerCase().includes(b.description.toLowerCase())
            );

            if (alreadyPaid) {
                status = 'paid';
                icon = '✅';
            } else if (dueDate <= tomorrow) {
                status = 'urgent';
                icon = '⚠️';
            }

            return {
                date: dueDate,
                description: b.description,
                amount: Number(b.amount) || 0,
                status,
                icon
            };
        })
        .filter(c => c.date >= today) // Filtra apenas compromissos a partir de hoje
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, limit);

    return commitments;
}

/**
 * Detecta gastos fora do padrão (anomalias)
 */
export function detectSpendingAnomalies(
    transactions: Transaction[],
    threshold: number = 0.20 // 20% de aumento
): Array<{
    category: string;
    percentageChange: number;
    previousAmount: number;
    currentAmount: number;
}> {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - 7);

    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(currentWeekStart.getDate() - 7);

    // Agrupar por categoria
    const currentWeek: Record<string, number> = {};
    const previousWeek: Record<string, number> = {};

    transactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .forEach(t => {
            const txDate = toLocalDate(t.date);
            const category = t.category || 'Outros';
            const amount = Number(t.amount) || 0;

            if (txDate >= currentWeekStart && txDate <= now) {
                currentWeek[category] = (currentWeek[category] || 0) + amount;
            } else if (txDate >= previousWeekStart && txDate < currentWeekStart) {
                previousWeek[category] = (previousWeek[category] || 0) + amount;
            }
        });

    const anomalies: Array<{
        category: string;
        percentageChange: number;
        previousAmount: number;
        currentAmount: number;
    }> = [];

    Object.keys(currentWeek).forEach(category => {
        const current = currentWeek[category];
        const previous = previousWeek[category] || 0;

        if (previous === 0 && current > 0) {
            // Nova categoria com gastos
            anomalies.push({
                category,
                percentageChange: 100,
                previousAmount: 0,
                currentAmount: current
            });
        } else if (previous > 0) {
            const change = (current - previous) / previous;
            if (change >= threshold) {
                anomalies.push({
                    category,
                    percentageChange: Math.round(change * 100),
                    previousAmount: previous,
                    currentAmount: current
                });
            }
        }
    });

    return anomalies.sort((a, b) => b.percentageChange - a.percentageChange);
}

/**
 * Gera insights baseados em regras fixas
 */
export interface FinancialInsight {
    type: 'goal' | 'alert' | 'tip';
    title: string;
    message: string;
    icon: string;
    color: string;
}

export function generateRuleBasedInsights(
    transactions: Transaction[],
    goals: FinancialGoal[],
    budgets: Budget[],
    projectedBalance: number
): FinancialInsight[] {
    const insights: FinancialInsight[] = [];

    // Insight 1: Progresso de Metas
    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
    if (activeGoals.length > 0) {
        const closestGoal = activeGoals.sort((a, b) => {
            const progressA = (a.currentAmount / a.targetAmount) * 100;
            const progressB = (b.currentAmount / b.targetAmount) * 100;
            return progressB - progressA;
        })[0];

        const remaining = closestGoal.targetAmount - closestGoal.currentAmount;
        insights.push({
            type: 'goal',
            title: 'Meta em Progresso',
            message: `Faltam ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)} para sua meta de "${closestGoal.title}"`,
            icon: '🎯',
            color: 'blue'
        });
    } else {
        // Mensagem motivacional se não houver metas
        insights.push({
            type: 'tip',
            title: 'Defina uma Meta',
            message: 'Que tal criar uma meta financeira? Ter objetivos claros ajuda a economizar!',
            icon: '🚀',
            color: 'purple'
        });
    }

    // Insight 2: Alertas de Gastos
    const anomalies = detectSpendingAnomalies(transactions);
    if (anomalies.length > 0) {
        const top = anomalies[0];
        insights.push({
            type: 'alert',
            title: 'Atenção aos Gastos',
            message: `Gastos com ${top.category} subiram ${top.percentageChange}% essa semana`,
            icon: '⚠️',
            color: 'orange'
        });
    } else {
        // Mensagem positiva se não houver anomalias
        insights.push({
            type: 'tip',
            title: 'Gastos Controlados',
            message: 'Seus gastos estão estáveis! Continue assim! 💪',
            icon: '✨',
            color: 'green'
        });
    }

    // Insight 3: Recomendações
    if (projectedBalance > 500) {
        const suggestedAmount = Math.floor(projectedBalance * 0.2); // 20% do saldo projetado
        insights.push({
            type: 'tip',
            title: 'Oportunidade de Investimento',
            message: `Aporte sugerido: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(suggestedAmount)} para investimentos`,
            icon: '💰',
            color: 'green'
        });
    } else if (projectedBalance < 0) {
        insights.push({
            type: 'alert',
            title: 'Atenção ao Orçamento',
            message: 'Seu saldo está negativo. Revise seus gastos fixos e considere cortar despesas não essenciais.',
            icon: '🔴',
            color: 'red'
        });
    } else {
        // Mensagem motivacional genérica
        insights.push({
            type: 'tip',
            title: 'Continue Atento',
            message: 'Acompanhe seus gastos diariamente para manter o controle financeiro!',
            icon: '📊',
            color: 'blue'
        });
    }

    return insights;
}

/**
 * Calcula dados para o gráfico de burn rate (dia a dia)
 */
export function calculateBurnRateChartData(
    transactions: Transaction[],
    currentMonth: string
): Array<{
    day: number;
    income: number;
    expense: number;
    balance: number;
}> {
    const [year, month] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const currentDay = today.getDate();

    // Inicializar array com todos os dias do mês
    const chartData = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        income: 0,
        expense: 0,
        balance: 0
    }));

    // Agrupar transações por dia
    const dailyData: Record<number, { income: number; expense: number }> = {};

    transactions.forEach(t => {
        const txDate = toLocalDate(t.date);
        if (txDate.getMonth() + 1 !== month || txDate.getFullYear() !== year) return;

        const day = txDate.getDate();
        if (!dailyData[day]) {
            dailyData[day] = { income: 0, expense: 0 };
        }

        const amount = Number(t.amount) || 0;
        if (t.type === TransactionType.INCOME) {
            dailyData[day].income += amount;
        } else {
            dailyData[day].expense += amount;
        }
    });

    // Calcular acumulados
    let cumulativeIncome = 0;
    let cumulativeExpense = 0;

    chartData.forEach((item, index) => {
        const day = item.day;
        const data = dailyData[day] || { income: 0, expense: 0 };

        cumulativeIncome += data.income;
        cumulativeExpense += data.expense;

        item.income = cumulativeIncome;
        item.expense = cumulativeExpense;
        item.balance = cumulativeIncome - cumulativeExpense;
    });

    return chartData;
}
